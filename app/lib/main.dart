import 'dart:async';
import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:uuid/uuid.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ClawApp());
}

class ClawApp extends StatelessWidget {
  const ClawApp({super.key});

  @override
  Widget build(BuildContext context) {
    return RepositoryProvider(
      create: (_) => AppRepository(),
      child: Builder(
        builder: (context) {
          final repository = context.read<AppRepository>();
          return MultiBlocProvider(
            providers: [
              BlocProvider(create: (_) => AuthCubit(repository)..bootstrap()),
              BlocProvider(create: (_) => ChatCubit(repository)),
            ],
            child: MaterialApp(
              debugShowCheckedModeBanner: false,
              title: 'ClawDesktop',
              theme: ThemeData.dark().copyWith(
                scaffoldBackgroundColor: const Color(0xFF0D0D0D),
                colorScheme: const ColorScheme.dark(
                  primary: Color(0xFFFC5F34),
                  secondary: Color(0xFFE55F4D),
                  surface: Color(0xFF141414),
                ),
                inputDecorationTheme: InputDecorationTheme(
                  filled: true,
                  fillColor: const Color(0xFF141414),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFF262626)),
                  ),
                ),
              ),
              home: const AppGate(),
            ),
          );
        },
      ),
    );
  }
}

class AppGate extends StatelessWidget {
  const AppGate({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthCubit, AuthState>(
      listener: (context, state) {
        if (state.isAuthenticated) {
          context.read<ChatCubit>().initialize(state.user!);
        } else {
          context.read<ChatCubit>().clear();
        }
      },
      builder: (context, state) {
        if (state.isBootstrapping) {
          return const Scaffold(body: Center(child: CircularProgressIndicator()));
        }
        if (!state.isAuthenticated) return const LoginPage();
        return const ChatPage();
      },
    );
  }
}

class AppRepository {
  AppRepository() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final accessToken = await _storage.read(key: 'access_token');
          if (accessToken != null) {
            options.headers['Authorization'] = 'Bearer $accessToken';
          }
          options.headers['x-device-id'] = await _getDeviceId();
          return handler.next(options);
        },
        onError: (error, handler) async {
          final request = error.requestOptions;
          final path = request.path;
          final skipRefresh = path.contains('/auth/login') || path.contains('/auth/register') || path.contains('/auth/refresh');
          if (!skipRefresh && error.response?.statusCode == 401 && request.extra['retry'] != true) {
            final refreshed = await refreshToken();
            if (refreshed) {
              request.extra['retry'] = true;
              final accessToken = await _storage.read(key: 'access_token');
              request.headers['Authorization'] = 'Bearer $accessToken';
              final response = await _dio.fetch(request);
              return handler.resolve(response);
            }
          }
          return handler.next(error);
        },
      ),
    );
  }

  final Dio _dio = Dio(
    BaseOptions(
      baseUrl: const String.fromEnvironment('API_URL', defaultValue: 'https://api.clawdesktop.vn'),
      connectTimeout: const Duration(seconds: 8),
      receiveTimeout: const Duration(seconds: 12),
      sendTimeout: const Duration(seconds: 12),
    ),
  );
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final Uuid _uuid = const Uuid();
  io.Socket? _socket;

  Future<String> _getDeviceId() async {
    final prefs = await SharedPreferences.getInstance();
    final existing = prefs.getString('device_id');
    if (existing != null) return existing;
    final id = 'device_${_uuid.v4()}';
    await prefs.setString('device_id', id);
    return id;
  }

  Future<AuthPayload> login(String email, String password) async {
    final res = await _dio.post('/auth/login', data: {'email': email, 'password': password});
    return _saveAuthData(_unwrapData(res.data));
  }

  Future<AuthPayload> register(String username, String email, String password) async {
    final res = await _dio.post('/auth/register', data: {'username': username, 'email': email, 'password': password});
    return _saveAuthData(_unwrapData(res.data));
  }

  Future<bool> refreshToken() async {
    final refresh = await _storage.read(key: 'refresh_token');
    if (refresh == null) return false;
    try {
      final res = await _dio.post('/auth/refresh', data: {'refreshToken': refresh});
      final body = _unwrapData(res.data);
      await _storage.write(key: 'access_token', value: body['accessToken'] as String?);
      return true;
    } catch (_) {
      await clearSession();
      return false;
    }
  }

  Future<void> logout() async {
    final refresh = await _storage.read(key: 'refresh_token');
    await clearSession();
    if (refresh != null) {
      unawaited(_dio.post('/auth/logout', data: {'refreshToken': refresh}));
    }
  }

  Future<void> clearSession() async {
    await _storage.delete(key: 'access_token');
    await _storage.delete(key: 'refresh_token');
    await _storage.delete(key: 'user');
    _socket?.disconnect();
  }

  Future<UserModel?> getSavedUser() async {
    final userRaw = await _storage.read(key: 'user');
    if (userRaw == null) return null;
    return UserModel.fromJson(jsonDecode(userRaw) as Map<String, dynamic>);
  }

  Future<AuthPayload> _saveAuthData(dynamic data) async {
    final payload = AuthPayload.fromJson(data as Map<String, dynamic>);
    await _storage.write(key: 'access_token', value: payload.accessToken);
    await _storage.write(key: 'refresh_token', value: payload.refreshToken);
    await _storage.write(key: 'user', value: jsonEncode(payload.user.toJson()));
    return payload;
  }

  Map<String, dynamic> _unwrapData(dynamic data) {
    if (data is Map<String, dynamic>) {
      final nested = data['data'];
      if (nested is Map<String, dynamic>) return nested;
      return data;
    }
    throw const FormatException('Unexpected API response format');
  }

  List<dynamic> _unwrapListData(dynamic data) {
    if (data is Map<String, dynamic>) {
      final nested = data['data'];
      if (nested is List<dynamic>) return nested;
      return const [];
    }
    if (data is List<dynamic>) return data;
    return const [];
  }

  Future<List<ThreadModel>> getThreads({int page = 1, int take = 10}) async {
    final res = await _dio.get('/threads', queryParameters: {'page': page, 'take': take});
    final list = _unwrapListData(res.data)
        .map((e) => ThreadModel.fromJson(e as Map<String, dynamic>))
        .toList();
    return list;
  }

  Future<ThreadModel> createThread(String title) async {
    final res = await _dio.post('/threads', data: {'title': title});
    return ThreadModel.fromJson(_unwrapData(res.data));
  }

  Future<void> deleteThread(String id) async {
    await _dio.delete('/threads/$id');
  }

  Future<List<MessageModel>> getMessages(String threadId) async {
    final res = await _dio.get('/threads/$threadId/messages');
    return _unwrapListData(res.data)
        .map((e) => MessageModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> sendMessage(String threadId, String content, {String? imageUrl}) async {
    await _dio.post('/threads/$threadId/messages', data: {'content': content, 'image_url': imageUrl});
  }

  Future<String> uploadImage(XFile file) async {
    final form = FormData.fromMap({'file': await MultipartFile.fromFile(file.path, filename: file.name)});
    final res = await _dio.post('/upload/image', data: form);
    final body = _unwrapData(res.data);
    final url = body['url'];
    if (url is String && url.isNotEmpty) return url;
    throw const FormatException('Upload response missing url');
  }

  io.Socket connectSocket() {
    if (_socket != null) return _socket!;
    _socket = io.io(
      const String.fromEnvironment('API_URL', defaultValue: 'https://api.clawdesktop.vn'),
      io.OptionBuilder().setTransports(['websocket']).disableAutoConnect().setReconnectionAttempts(999999).build(),
    );
    _socket!.connect();
    return _socket!;
  }
}

class UserModel extends Equatable {
  const UserModel({required this.id, required this.email, required this.username, required this.role});
  final String id;
  final String email;
  final String username;
  final String role;

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
        id: json['id'].toString(),
        email: json['email'] as String,
        username: json['username'] as String,
        role: json['role'] as String? ?? 'user',
      );
  Map<String, dynamic> toJson() => {'id': id, 'email': email, 'username': username, 'role': role};
  @override
  List<Object?> get props => [id, email, username, role];
}

class ThreadModel extends Equatable {
  const ThreadModel({required this.id, required this.title, required this.updatedAt});
  final String id;
  final String title;
  final DateTime updatedAt;
  factory ThreadModel.fromJson(Map<String, dynamic> json) => ThreadModel(
        id: json['id'].toString(),
        title: json['title'] as String? ?? 'New conversation',
        updatedAt: DateTime.tryParse(json['updated_at'] as String? ?? '') ?? DateTime.now(),
      );
  @override
  List<Object?> get props => [id, title, updatedAt];
}

class MessageModel extends Equatable {
  const MessageModel({required this.id, required this.content, required this.role, required this.createdAt, this.imageUrl});
  final String id;
  final String content;
  final String role;
  final DateTime createdAt;
  final String? imageUrl;
  factory MessageModel.fromJson(Map<String, dynamic> json) => MessageModel(
        id: json['id'].toString(),
        content: (json['content'] as String?) ?? '',
        role: json['role'] as String? ?? 'ai',
        createdAt: DateTime.tryParse(json['created_at'] as String? ?? '') ?? DateTime.now(),
        imageUrl: json['image_url'] as String?,
      );
  @override
  List<Object?> get props => [id, content, role, createdAt, imageUrl];
}

class AuthPayload {
  AuthPayload({required this.user, required this.accessToken, required this.refreshToken});
  final UserModel user;
  final String accessToken;
  final String refreshToken;
  factory AuthPayload.fromJson(Map<String, dynamic> json) => AuthPayload(
        user: UserModel.fromJson(json['user'] as Map<String, dynamic>),
        accessToken: json['accessToken'] as String,
        refreshToken: json['refreshToken'] as String,
      );
}

class AuthState extends Equatable {
  const AuthState({this.user, this.isBootstrapping = true, this.isSubmitting = false, this.error});
  final UserModel? user;
  final bool isBootstrapping;
  final bool isSubmitting;
  final String? error;
  bool get isAuthenticated => user != null;
  AuthState copyWith({UserModel? user, bool? isBootstrapping, bool? isSubmitting, String? error}) =>
      AuthState(
        user: user ?? this.user,
        isBootstrapping: isBootstrapping ?? this.isBootstrapping,
        isSubmitting: isSubmitting ?? this.isSubmitting,
        error: error,
      );
  @override
  List<Object?> get props => [user, isBootstrapping, isSubmitting, error];
}

class AuthCubit extends Cubit<AuthState> {
  AuthCubit(this._repo) : super(const AuthState());
  final AppRepository _repo;

  Future<void> bootstrap() async {
    final user = await _repo.getSavedUser();
    emit(state.copyWith(user: user, isBootstrapping: false));
  }

  Future<void> login(String email, String password) async {
    if (state.isSubmitting) return;
    emit(state.copyWith(isSubmitting: true, error: null));
    try {
      final auth = await _repo.login(email, password);
      emit(state.copyWith(user: auth.user, isSubmitting: false, error: null));
    } on DioException catch (e) {
      emit(state.copyWith(isSubmitting: false, error: _readableError(e, fallback: 'Đăng nhập thất bại, vui lòng thử lại.')));
    } catch (_) {
      emit(state.copyWith(isSubmitting: false, error: 'Đăng nhập thất bại, vui lòng thử lại.'));
    }
  }

  Future<void> register(String username, String email, String password) async {
    if (state.isSubmitting) return;
    emit(state.copyWith(isSubmitting: true, error: null));
    try {
      final auth = await _repo.register(username, email, password);
      emit(state.copyWith(user: auth.user, isSubmitting: false, error: null));
    } on DioException catch (e) {
      emit(state.copyWith(isSubmitting: false, error: _readableError(e, fallback: 'Đăng ký thất bại, vui lòng thử lại.')));
    } catch (_) {
      emit(state.copyWith(isSubmitting: false, error: 'Đăng ký thất bại, vui lòng thử lại.'));
    }
  }

  Future<void> logout() async {
    try {
      await _repo.logout();
    } catch (_) {
      await _repo.clearSession();
    }
    emit(const AuthState(isBootstrapping: false));
  }

  String _readableError(DioException e, {required String fallback}) {
    if (e.type == DioExceptionType.connectionError || e.type == DioExceptionType.connectionTimeout) {
      return 'Không kết nối được tới server. Kiểm tra API_URL và mạng.';
    }
    final data = e.response?.data;
    if (data is Map<String, dynamic>) {
      final nested = data['data'];
      final message = data['message'] ?? data['msg'] ?? (nested is Map<String, dynamic> ? nested['message'] : null);
      if (message is String && message.trim().isNotEmpty) return message;
    }
    return fallback;
  }
}

class ChatState extends Equatable {
  const ChatState({
    this.user,
    this.threads = const [],
    this.activeThread,
    this.messages = const [],
    this.streamingText = '',
    this.isTyping = false,
    this.loadingThreads = false,
    this.sending = false,
    this.offline = false,
    this.error,
  });
  final UserModel? user;
  final List<ThreadModel> threads;
  final ThreadModel? activeThread;
  final List<MessageModel> messages;
  final String streamingText;
  final bool isTyping;
  final bool loadingThreads;
  final bool sending;
  final bool offline;
  final String? error;
  ChatState copyWith({
    UserModel? user,
    List<ThreadModel>? threads,
    ThreadModel? activeThread,
    List<MessageModel>? messages,
    String? streamingText,
    bool? isTyping,
    bool? loadingThreads,
    bool? sending,
    bool? offline,
    String? error,
  }) {
    return ChatState(
      user: user ?? this.user,
      threads: threads ?? this.threads,
      activeThread: activeThread ?? this.activeThread,
      messages: messages ?? this.messages,
      streamingText: streamingText ?? this.streamingText,
      isTyping: isTyping ?? this.isTyping,
      loadingThreads: loadingThreads ?? this.loadingThreads,
      sending: sending ?? this.sending,
      offline: offline ?? this.offline,
      error: error,
    );
  }

  @override
  List<Object?> get props => [user, threads, activeThread, messages, streamingText, isTyping, loadingThreads, sending, offline, error];
}

class ChatCubit extends Cubit<ChatState> {
  ChatCubit(this._repo) : super(const ChatState());
  final AppRepository _repo;
  io.Socket? _socket;
  StreamSubscription? _typingTimer;

  Future<void> initialize(UserModel user) async {
    emit(state.copyWith(user: user, loadingThreads: true));
    await loadThreads();
    _bindSocket();
  }

  void clear() {
    _typingTimer?.cancel();
    _socket?.disconnect();
    emit(const ChatState());
  }

  Future<void> loadThreads() async {
    try {
      final threads = await _repo.getThreads();
      emit(state.copyWith(threads: threads, loadingThreads: false));
    } catch (_) {
      emit(state.copyWith(loadingThreads: false, error: 'Không tải được danh sách hội thoại.'));
    }
  }

  Future<void> createThread() async {
    final temp = ThreadModel(id: 'temp-${DateTime.now().millisecondsSinceEpoch}', title: 'New conversation', updatedAt: DateTime.now());
    emit(state.copyWith(threads: [temp, ...state.threads], activeThread: temp, messages: []));
    try {
      final real = await _repo.createThread('New conversation');
      final list = state.threads.map((e) => e.id == temp.id ? real : e).toList();
      emit(state.copyWith(threads: list, activeThread: real));
      await openThread(real);
    } catch (_) {
      emit(state.copyWith(threads: state.threads.where((e) => e.id != temp.id).toList()));
    }
  }

  Future<void> openThread(ThreadModel thread) async {
    if (thread.id.startsWith('temp-')) return;
    try {
      _socket?.emit('join:thread', {'threadId': thread.id});
      final messages = await _repo.getMessages(thread.id);
      emit(state.copyWith(activeThread: thread, messages: messages, streamingText: '', isTyping: false, error: null));
    } on DioException catch (e) {
      emit(state.copyWith(error: _chatError(e)));
    } catch (_) {
      emit(state.copyWith(error: 'Không mở được cuộc hội thoại.'));
    }
  }

  Future<void> deleteThread(ThreadModel thread) async {
    try {
      if (!thread.id.startsWith('temp-')) {
        await _repo.deleteThread(thread.id);
      }
      emit(state.copyWith(
        threads: state.threads.where((e) => e.id != thread.id).toList(),
        activeThread: state.activeThread?.id == thread.id ? null : state.activeThread,
        messages: state.activeThread?.id == thread.id ? [] : state.messages,
        error: null,
      ));
    } on DioException catch (e) {
      emit(state.copyWith(error: _chatError(e)));
    } catch (_) {
      emit(state.copyWith(error: 'Xóa cuộc hội thoại thất bại.'));
    }
  }

  Future<void> sendMessage(String text, {XFile? imageFile}) async {
    if (state.sending || state.activeThread == null) return;
    if (text.trim().isEmpty && imageFile == null) return;
    emit(state.copyWith(sending: true, error: null));
    String? imageUrl;
    try {
      if (imageFile != null) imageUrl = await _repo.uploadImage(imageFile);
      final optimistic = MessageModel(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        content: text,
        role: 'user',
        createdAt: DateTime.now(),
        imageUrl: imageUrl,
      );
      emit(state.copyWith(messages: [...state.messages, optimistic], sending: true));
      await _repo.sendMessage(state.activeThread!.id, text, imageUrl: imageUrl);
    } on DioException catch (e) {
      emit(state.copyWith(error: _chatError(e)));
    } catch (_) {
      emit(state.copyWith(error: 'Không gửi được tin nhắn.'));
    } finally {
      emit(state.copyWith(sending: false));
    }
  }

  void _bindSocket() {
    _socket = _repo.connectSocket();
    _socket!.on('disconnect', (_) => emit(state.copyWith(offline: true)));
    _socket!.on('connect', (_) => emit(state.copyWith(offline: false)));
    _socket!.on('thread:typing', (_) {
      emit(state.copyWith(isTyping: true, streamingText: ''));
      _typingTimer?.cancel();
      _typingTimer = Stream<void>.periodic(const Duration(seconds: 3)).take(1).listen((_) {
        emit(state.copyWith(isTyping: false));
      });
    });
    _socket!.on('thread:stream', (data) {
      final chunk = (data as Map<String, dynamic>)['chunk'] as String? ?? '';
      emit(state.copyWith(isTyping: false, streamingText: '${state.streamingText}$chunk'));
    });
    _socket!.on('thread:stream:done', (data) {
      final message = MessageModel.fromJson((data as Map<String, dynamic>)['message'] as Map<String, dynamic>);
      emit(state.copyWith(messages: [...state.messages, message], streamingText: ''));
    });
    _socket!.on('thread:stream:error', (_) {
      emit(state.copyWith(isTyping: false, streamingText: ''));
    });
  }

  String _chatError(DioException e) {
    if (e.type == DioExceptionType.connectionError || e.type == DioExceptionType.connectionTimeout) {
      return 'Không kết nối được server. Kiểm tra API_URL và backend.';
    }
    final data = e.response?.data;
    if (data is Map<String, dynamic>) {
      final message = data['message'] ?? data['msg'];
      if (message is String && message.trim().isNotEmpty) return message;
      final nested = data['data'];
      if (nested is Map<String, dynamic>) {
        final nestedMessage = nested['message'];
        if (nestedMessage is String && nestedMessage.trim().isNotEmpty) return nestedMessage;
      }
    }
    return 'Có lỗi khi gọi API chat.';
  }
}

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});
  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _showPassword = false;

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AuthCubit>().state;
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Container(
            width: 420,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: const Color(0xFF141414),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF262626)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text('Chào mừng trở lại', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                const Text('Đăng nhập để tiếp tục cuộc trò chuyện', style: TextStyle(color: Colors.white70)),
                const SizedBox(height: 24),
                TextField(controller: _email, decoration: const InputDecoration(labelText: 'Email')),
                const SizedBox(height: 12),
                TextField(
                  controller: _password,
                  obscureText: !_showPassword,
                  decoration: InputDecoration(
                    labelText: 'Mật khẩu',
                    suffixIcon: IconButton(
                      onPressed: () => setState(() => _showPassword = !_showPassword),
                      icon: Icon(_showPassword ? Icons.visibility_off : Icons.visibility),
                    ),
                  ),
                ),
                if (state.error != null) ...[
                  const SizedBox(height: 12),
                  Text(state.error!, style: const TextStyle(color: Colors.redAccent)),
                ],
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: state.isSubmitting ? null : () => context.read<AuthCubit>().login(_email.text.trim(), _password.text.trim()),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFC5F34),
                    foregroundColor: Colors.black,
                    disabledForegroundColor: Colors.black54,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: state.isSubmitting
                      ? const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black)),
                            SizedBox(width: 8),
                            Text('Đang đăng nhập...', style: TextStyle(color: Colors.black)),
                          ],
                        )
                      : const Text('Đăng nhập'),
                ),
                TextButton(
                  onPressed: state.isSubmitting ? null : () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const RegisterPage())),
                  child: const Text('Chưa có tài khoản? Tạo tài khoản'),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});
  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _username = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  @override
  Widget build(BuildContext context) {
    final state = context.watch<AuthCubit>().state;
    return Scaffold(
      appBar: AppBar(backgroundColor: Colors.transparent, title: const Text('Tạo tài khoản')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Container(
            width: 420,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(color: const Color(0xFF141414), borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFF262626))),
            child: Column(
              children: [
                TextField(controller: _username, decoration: const InputDecoration(labelText: 'Username')),
                const SizedBox(height: 12),
                TextField(controller: _email, decoration: const InputDecoration(labelText: 'Email')),
                const SizedBox(height: 12),
                TextField(controller: _password, obscureText: true, decoration: const InputDecoration(labelText: 'Password')),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: state.isSubmitting
                      ? null
                      : () => context.read<AuthCubit>().register(_username.text.trim(), _email.text.trim(), _password.text.trim()),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFC5F34),
                    foregroundColor: Colors.black,
                    disabledForegroundColor: Colors.black54,
                    padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 20),
                  ),
                  child: state.isSubmitting
                      ? const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black)),
                            SizedBox(width: 8),
                            Text('Đang xử lý...', style: TextStyle(color: Colors.black)),
                          ],
                        )
                      : const Text('Create Account'),
                ),
                if (state.error != null) ...[
                  const SizedBox(height: 12),
                  Text(state.error!, style: const TextStyle(color: Colors.redAccent)),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class ChatPage extends StatefulWidget {
  const ChatPage({super.key});
  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  final _text = TextEditingController();
  final _picker = ImagePicker();
  XFile? _pendingImage;

  @override
  Widget build(BuildContext context) {
    final state = context.watch<ChatCubit>().state;
    Widget threadSidebar({required bool closeOnSelect}) {
      return Container(
        width: 280,
        color: const Color(0xFF141414),
        child: Column(
          children: [
            ListTile(
              title: const Text('ClawDesktop', style: TextStyle(fontWeight: FontWeight.bold)),
              trailing: IconButton(icon: const Icon(Icons.add), onPressed: () => context.read<ChatCubit>().createThread()),
            ),
            Expanded(
              child: state.loadingThreads
                  ? const Center(child: CircularProgressIndicator())
                  : ListView.builder(
                      itemCount: state.threads.length,
                      itemBuilder: (context, index) {
                        final thread = state.threads[index];
                        final active = thread.id == state.activeThread?.id;
                        return ListTile(
                          selected: active,
                          title: Text(thread.title, maxLines: 1, overflow: TextOverflow.ellipsis),
                          subtitle: Text(DateFormat('HH:mm').format(thread.updatedAt)),
                          onTap: () async {
                            await context.read<ChatCubit>().openThread(thread);
                            if (closeOnSelect && context.mounted) Navigator.of(context).pop();
                          },
                          trailing: IconButton(icon: const Icon(Icons.delete_outline), onPressed: () => context.read<ChatCubit>().deleteThread(thread)),
                        );
                      },
                    ),
            ),
            ListTile(
              title: Text(state.user?.username ?? ''),
              subtitle: Text(state.user?.email ?? ''),
              trailing: IconButton(icon: const Icon(Icons.logout), onPressed: () => context.read<AuthCubit>().logout()),
            ),
          ],
        ),
      );
    }

    Widget chatBody() {
      return Column(
        children: [
          if (state.offline) Container(width: double.infinity, color: Colors.amber, padding: const EdgeInsets.all(8), child: const Text('Mất kết nối - đang tự động kết nối lại...')),
          Expanded(
            child: state.activeThread == null
                ? Center(
                    child: Column(mainAxisSize: MainAxisSize.min, children: [
                      const Icon(Icons.message_outlined, size: 40, color: Color(0xFFFC5F34)),
                      const SizedBox(height: 8),
                      const Text('Select or start a conversation'),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: () => context.read<ChatCubit>().createThread(),
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFC5F34), foregroundColor: Colors.black),
                        child: const Text('New Chat'),
                      ),
                    ]),
                  )
                : ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      ...state.messages.where((m) => m.role != 'admin_draft').map(
                        (m) => Align(
                          alignment: m.role == 'user' ? Alignment.centerRight : Alignment.centerLeft,
                          child: Container(
                            constraints: const BoxConstraints(maxWidth: 520),
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: m.role == 'user' ? const Color(0x33295f4d) : const Color(0xFF141414),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFF262626)),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (m.imageUrl != null) Padding(padding: const EdgeInsets.only(bottom: 8), child: Image.network(m.imageUrl!, height: 180)),
                                m.role == 'user' ? Text(m.content) : MarkdownBody(data: m.content),
                                const SizedBox(height: 4),
                                Text(DateFormat('HH:mm').format(m.createdAt), style: const TextStyle(color: Colors.white54, fontSize: 11)),
                              ],
                            ),
                          ),
                        ),
                      ),
                      if (state.isTyping) const Align(alignment: Alignment.centerLeft, child: Text('AI đang nhập...')),
                      if (state.streamingText.isNotEmpty)
                        Align(
                          alignment: Alignment.centerLeft,
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(color: const Color(0xFF141414), borderRadius: BorderRadius.circular(12)),
                            child: MarkdownBody(data: state.streamingText),
                          ),
                        ),
                    ],
                  ),
          ),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(border: Border(top: BorderSide(color: Color(0xFF262626)))),
            child: Row(
              children: [
                IconButton(
                  onPressed: state.sending
                      ? null
                      : () async {
                          final file = await _picker.pickImage(source: ImageSource.gallery);
                          if (file != null) setState(() => _pendingImage = file);
                        },
                  icon: const Icon(Icons.attach_file),
                ),
                Expanded(
                  child: TextField(
                    controller: _text,
                    minLines: 1,
                    maxLines: 4,
                    decoration: InputDecoration(
                      hintText: _pendingImage == null ? 'Type a message...' : 'Image attached: ${_pendingImage!.name}',
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: state.sending
                      ? null
                      : () async {
                          final text = _text.text.trim();
                          _text.clear();
                          await context.read<ChatCubit>().sendMessage(text, imageFile: _pendingImage);
                          if (mounted) setState(() => _pendingImage = null);
                        },
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFC5F34), foregroundColor: Colors.black),
                  child: state.sending
                      ? const Row(mainAxisSize: MainAxisSize.min, children: [SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black)), SizedBox(width: 8), Text('Đang gửi...')])
                      : const Icon(Icons.send),
                )
              ],
            ),
          ),
        ],
      );
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final isMobile = constraints.maxWidth < 900;
        return Scaffold(
          appBar: isMobile
              ? AppBar(
                  title: Text(state.activeThread?.title ?? 'ClawDesktop'),
                  leading: Builder(
                    builder: (context) => IconButton(
                      icon: const Icon(Icons.menu),
                      onPressed: () => Scaffold.of(context).openDrawer(),
                    ),
                  ),
                  actions: [
                    IconButton(icon: const Icon(Icons.add), onPressed: () => context.read<ChatCubit>().createThread()),
                  ],
                )
              : null,
          drawer: isMobile ? Drawer(child: SafeArea(child: threadSidebar(closeOnSelect: true))) : null,
          body: isMobile
              ? SafeArea(child: chatBody())
              : Row(
                  children: [
                    threadSidebar(closeOnSelect: false),
                    Expanded(child: chatBody()),
                  ],
                ),
        );
      },
    );
  }
}

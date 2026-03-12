import 'package:flutter/material.dart';
import 'package:project_management/core/constants/app_constants.dart';
import 'package:project_management/core/networks/api_client.dart';
import 'package:project_management/features/authorization/data/repositories/auth_repository.dart';
import 'package:project_management/features/authorization/presentation/pages/login.dart';
import 'package:project_management/features/authorization/presentation/providers/auth_provider.dart';
import 'package:project_management/features/authorization/presentation/pages/register.dart';
import 'package:project_management/features/dashboard/data/repositories/dashboard_repository.dart';
import 'package:project_management/features/dashboard/presentation/pages/admin_dashboard_page.dart';
import 'package:project_management/features/dashboard/presentation/providers/dashboard_provider.dart';
import 'package:provider/provider.dart';
import './theme/app_theme.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  MyApp({super.key});

  // Create ApiClient instance here
  final ApiClient apiClient = ApiClient(baseUrl: AppConstant.baseUrl);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        // 1. Provide the ApiClient
        Provider<ApiClient>(create: (_) => apiClient),

        // 2. Auth Provider
        ChangeNotifierProvider(
          create: (context) {
            final client = Provider.of<ApiClient>(context, listen: false);
            return AuthProvider(
              AuthRepositoryImpl(client), 
            );
          },
        ),

        // 3. Dashboard Provider (UPDATED TO USE NAMED PARAMETERS)
        ChangeNotifierProvider(
          create: (context) {
            final client = Provider.of<ApiClient>(context, listen: false);
            return DashboardProvider(
              repository: DashboardRepository(apiClient: client), // Added 'repository:' and 'apiClient:'
            );
          },
        ),
      ],
      child: MaterialApp(
        title: 'Project Management App',
        theme: AppTheme.darkblueTheme,
        debugShowCheckedModeBanner: false,
        initialRoute: '/login',
        routes: {
          '/login': (context) => const LoginPage(),
          '/register': (context) => const RegisterPage(),
          '/adminDashboard': (context) => const AdminDashboardPage(),
        },
      ),
    );
  }
}
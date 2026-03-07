import 'package:flutter/material.dart';
import 'package:project_management/core/constants/app_constants.dart';
import 'package:project_management/core/networks/api_client.dart';
import 'package:project_management/features/authorization/presentation/pages/login.dart';
import 'package:project_management/features/authorization/presentation/providers/auth_provider.dart';
import 'package:project_management/features/authorization/presentation/pages/register.dart';
import 'package:provider/provider.dart';
import './theme/app_theme.dart';
import './features/authorization/data/repositories/auth_repo.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  MyApp({super.key});

  //  Create ApiClient instance here
  final ApiClient apiClient = ApiClient(baseUrl: AppConstant.baseUrl);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        //  Provide the ApiClient first
        Provider<ApiClient>(create: (_) => apiClient),

        //  Then create AuthRepository with the ApiClient
        ChangeNotifierProvider(
          create: (context) {
            final apiClient = Provider.of<ApiClient>(context, listen: false);
            return AuthProvider(
              AuthRepository(apiClient), //  Pass the ApiClient here
            );
          },
        ),

        // Task Change Notifier
      ],
      child: MaterialApp(
        title: 'Project Management App',
        theme: AppTheme.darkblueTheme,
        debugShowCheckedModeBanner: false,
        initialRoute: '/register',
        routes: {
          '/login': (context) => LoginPage(),
          '/register': (context) => RegisterPage(),
         
        },
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:project_management/features/authorization/presentation/providers/auth_provider.dart';
import 'package:project_management/features/authorization/presentation/pages/register.dart';
import 'package:provider/provider.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});
  @override
  // ignore: library_private_types_in_public_api
  _LoginPage createState() => _LoginPage();
}

class _LoginPage extends State<LoginPage> {
  bool _isPasswordVisible = false;
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  void _login() async {
    // Stirng username = username
    print("Login page is being checked");
    if (_formKey.currentState!.validate()) {
      String username = _usernameController.text.trim();
      String password = _passwordController.text.trim();
      print("$password - $username");
      print("Hello up there !");
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      await authProvider.login(username, password);
      // if (authProvider.currentUser != null) {
      //  final snackBar =  ScaffoldMessenger.of(context).showSnackBar(
      //     SnackBar(content: Text(authProvider.currentUser!.welcomeUser()),
      //             duration: Duration(seconds: 1),),
      //   );
      //   // waits snackbar to be closed before navigating to /home
      // await snackBar.closed;
      Navigator.pushNamed(context, '/register');
      // } else {
      //   ScaffoldMessenger.of(
      //     context,
      //   ).showSnackBar(SnackBar(content: Text(authProvider.error!)));
      // }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Form(
          key: _formKey,

          child: Padding(
            padding: EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                SizedBox(height: 30),
                Text(
                  "Project Management",
                  style: TextStyle(fontSize: 26, color: Colors.white),
                ),

                SizedBox(height: 10),
                Container(
                  padding: EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white10,
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Login to Account',
                        style: TextStyle(fontSize: 20, color: Colors.white),
                      ),
                      SizedBox(height: 10),
                      Text(
                        'email',
                        style: TextStyle(fontSize: 16, color: Colors.white60),
                      ),
                      SizedBox(height: 5),
                      TextField(
                        controller: _usernameController,
                        style: TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          prefixIcon: Icon(Icons.person),
                          hintText: 'Enter your email',
                          filled: true,
                          fillColor: Colors.white10,
                          hintStyle: TextStyle(color: Colors.white60),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                      SizedBox(height: 10),
                      Text(
                        'password',
                        style: TextStyle(color: Colors.white60, fontSize: 14),
                      ),
                      SizedBox(height: 5),
                      TextFormField(
                        controller: _passwordController,
                        obscureText: !_isPasswordVisible,
                        style: TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          prefixIcon: Icon(Icons.lock),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _isPasswordVisible
                                  ? Icons.visibility
                                  : Icons.visibility_off,
                              color: Colors.white30,
                            ),
                            onPressed: () {
                              setState(() {
                                if (_isPasswordVisible) {
                                  _isPasswordVisible = false;
                                } else {
                                  _isPasswordVisible = true;
                                }
                              });
                            },
                          ),
                          hintText: 'Enter your password',
                          hintStyle: TextStyle(
                            color: Colors.white30,
                            fontSize: 14,
                          ),
                          filled: true,
                          fillColor: Colors.white10,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                      SizedBox(height: 10),
                      Align(
                        alignment: Alignment.bottomRight,
                        child: Text(
                          'Forgot password?',
                          style: TextStyle(
                            color: Colors.yellowAccent[700],
                            fontSize: 12,
                          ),
                        ),
                      ),
                      SizedBox(height: 10),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _login,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Color(0xFF194F87),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          child: Text(
                            "Login to PM",
                            style: TextStyle(
                              fontSize: 18,
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                      SizedBox(height: 10),
                      Align(
                        alignment: Alignment.center,
                        child: Text(
                          "Don't have an account",
                          style: TextStyle(color: Colors.white38),
                        ),
                      ),
                      SizedBox(height: 10),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {
                            if (_formKey.currentState!.validate()) {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => RegisterPage(),
                                ),
                              );
                            }
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.black12,
                            side: BorderSide(color:  Color(0xFF194F87)),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          child: Text(
                            "Sign Up",
                            style: TextStyle(
                              color:  Color(0xFF194F87),
                              fontSize: 18,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 5),
                Text(
                  'By logging in, you agree to our Terms and Conditions',
                  style: TextStyle(fontSize: 10, color: Colors.white30),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

//we use this file to send request to backend
//

import 'package:project_management/core/networks/api_client.dart';
import 'package:project_management/core/networks/api_exceptions.dart';


class AuthRepository {
  final ApiClient _apiClient;

  AuthRepository(this._apiClient);

  Future<bool> login(String email, String password) async {
    try {
     // final response = 
      await _apiClient.post(
        'auth/login/',
        body: {'email': email, 'password': password},
      );
      //UserModel userModel = UserModel.fromJson(response);

      // final TokenManager tokenManager = TokenManager();
      // String token = userModel.accessToken ?? "";
      // tokenManager.saveToken(token);
      return true;
    } on ApiException catch (e) {
      print(e.toString());
      rethrow;
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  Future<bool> register(
    String name,
    String email,
    String password,
  ) async {
    try {
      await _apiClient.post(
        'auth/register/',
        body: {
          "name": name,
          "email": email,
          "password": password,
        },
      );
      return true;
    } on ApiException catch (e) {
      print(e.toString());
      rethrow;
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  // Future<UserModel> refresh() async {
  //   try {
  //     TokenManager tokenInstance = TokenManager();
  //     String? token = await tokenInstance.getToken();
  //     final response = await _apiClient.get(
  //       "users/myprofile",
  //       headers: {"Authorization": "Bearer $token"},
  //     );
  //     UserModel user = UserModel.fromJson(response);
  //     return user;
  //   } on ApiException catch (e) {
  //     print(e.toString());
  //     rethrow;
  //   } catch (e) {
  //     throw Exception(e.toString());
  //   }
  // }
} 
  // Future<bool> register(String fullname, String username, String password) async{
  //   try{
  //     Uri url = Uri.parse('${AppConstant.baseUrl}users/register/');
    
  //     final response = await http.post(
  //       url,
  //       headers:{
  //         'Content-Type':'application/json',
  //         'Accept':'application/json'
  //       },
  //       body: jsonEncode({
  //          "fullName":fullname,
  //         "username":username, 
  //         "password":password
  //         })
  //     );
  //      if(response.statusCode == 201){
  //    // final data = jsonDecode(response.body);
       
  //     return true;
      
  //   }
  //   else {
  //     throw Exception('Registration is failed');
  //   }
  //  }
  //  catch(e){
  //   throw Exception("there was an error while trying to register!");
  //  }
  //  }
  

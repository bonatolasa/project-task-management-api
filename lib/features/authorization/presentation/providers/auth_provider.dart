// provider is used as a bridge to transfer data between UI to either Domain layer or data layer
//logout means clearing token or removing token without sending request to backend

import 'package:flutter/material.dart';
import 'package:project_management/features/authorization/data/repositories/auth_repo.dart';

// import'package:chella_app/features/auth/presentation/providers/;
class AuthProvider with ChangeNotifier {
  // Initialize repo from the data layer
  final AuthRepository _repository;
  //to track loading in our app's state.
  //folder entity jedhamu uumamuu qaba ture
  // UserEntity? _currentUser;
  bool _isLoading = false;
  bool _userRegistered = false;
  String? _error;
  AuthProvider(this._repository);

  //! THE FOLLOWING ARE GETTER METHODS TO GET
  // THIS VARIABLES IN OTHER CLASSES !
  bool get isLoading => _isLoading;
  String? get error => _error;
  //UserEntity? get currentUser => _currentUser;
  bool get userRegistered => _userRegistered;
  Future<void> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      // final UserModel user =
      await _repository.login(email, password);
      // print("${user.username} is what we are looking for");

      // _currentUser = UserEntity(

      //   id:user.id,
      //    username: user.username,
      //   fullName:user.fullName,
      //   referralCode: user.referralCode,
      //   referredBy: user.referredBy,
      //   amount:user.amount,
      //   totalEarned: user.totalEarned,
      //   totalReferred: user.totalReferred
      //   // password: user.password,
      // );

      _error = null;
    } catch (e) {
      _error = e.toString();
      print("$_error");
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> register(String name, String email, String password) async {
    // _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _userRegistered = await _repository.register(name, email, password);
      notifyListeners();

      // ScaffoldMessenger.of(context).showSnackBar(
      //   const SnackBar(
      //     content: Text("User registered successfully"),
      //     duration: Duration(seconds: 2),
      //     backgroundColor: Colors.green,
      //   ),
      // );
    } catch (e) {
      _error = e.toString();
      // ScaffoldMessenger.of(context).showSnackBar(
      //   SnackBar(
      //     content: Text(_error!),
      //     backgroundColor: Colors.red,
      //   ),
      // );
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  //  Future<void> refresh() async{
  //   _isLoading =true;
  //   _error = null;
  //   notifyListeners();
  //   try{
  //     final UserModel user = await _repository.refresh();
  //     _currentUser =  UserEntity(

  //         id:user.id,
  //          username: user.username,
  //         fullName:user.fullName,
  //         referralCode: user.referralCode,
  //         referredBy: user.referredBy,
  //         amount:user.amount,
  //         totalEarned: user.totalEarned,
  //         totalReferred: user.totalReferred
  //         // password: user.password,
  //       );
  //   }
  //   catch(e){
  //     _error = e.toString();
  //   }
  //   finally{
  //     _isLoading = false;
  //     notifyListeners();
  //   }
  //   }
}

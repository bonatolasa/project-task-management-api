class ApiException implements Exception{
  final String message;
  final int? statusCode;
  ApiException(this.message,{this.statusCode});
  @override
  String toString()=>'ApiException: $message';
}
class BadRequestException extends ApiException{
  BadRequestException(String message): super(message,statusCode:400);
}
class UnauthorizedException extends ApiException{
  UnauthorizedException(String message): super(message, statusCode: 401);
}
class ForbiddenException extends ApiException{
  ForbiddenException(String message):super(message, statusCode:403);
}
class ServerException extends ApiException{
  ServerException(String message): super(message, statusCode:500);
}
class NetworkException extends ApiException{
  NetworkException(String message): super(message);
}
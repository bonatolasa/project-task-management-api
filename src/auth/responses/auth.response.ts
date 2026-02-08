export class AuthResponseDto {
  success: boolean;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      team?: string;
    };
    accessToken: string;
  };
  message: string;
}
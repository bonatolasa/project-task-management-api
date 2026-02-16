   import jwt from 'jsonwebtoken';

   export class CommonUtils{

   //jwt
    static generateJwtToken(jwtData){
        const generatedToken=jwt.sign(jwtData,process.env.JWT_SECRET!,{
            expiresIn:"1hr"
        })
        return generatedToken;
    }
}
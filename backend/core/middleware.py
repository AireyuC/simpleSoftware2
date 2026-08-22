import jwt
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

class JWTAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                # Decodificar el token JWT
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                user_id = payload.get('user_id')
                if user_id:
                    try:
                        user = User.objects.get(id=user_id)
                        request.user = user
                    except User.DoesNotExist:
                        pass
            except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
                # Token inválido o expirado; request.user permanecerá como estado por defecto
                pass
                
        response = self.get_response(request)
        return response

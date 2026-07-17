from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from core.responses import r201, r400

from .serializers import RegisterSerializer, UserSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return r400(serializer.errors)

        user = serializer.save()
        return r201(UserSerializer(user).data)

from rest_framework import status
from rest_framework.response import Response


def r200(data=None):
    return Response(data, status=status.HTTP_200_OK)


def r201(data):
    return Response(data, status=status.HTTP_201_CREATED)


def r400(message='Error al procesar los datos.'):
    return Response({'message': message, 'status': 'error'}, status=status.HTTP_400_BAD_REQUEST)


def r401(message='No está autorizado.'):
    return Response({'message': message, 'status': 'error'}, status=status.HTTP_401_UNAUTHORIZED)


def r404(message='Recurso no encontrado.'):
    return Response({'message': message, 'status': 'error'}, status=status.HTTP_404_NOT_FOUND)


def r409(message='Ha ocurrido una advertencia.'):
    return Response({'message': message, 'status': 'aviso'}, status=status.HTTP_409_CONFLICT)


def r422(message='Error de validación.'):
    return Response({'message': message, 'status': 'error'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)


def r500(message='Error interno, comunicar al administrador.'):
    return Response({'message': message, 'status': 'error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

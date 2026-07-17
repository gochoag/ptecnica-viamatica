import api from './client'

export function login({ email, password }) {
  return api.post('/auth/login/', { email, password }).then((res) => res.data)
}

export function register({ fullName, email, password }) {
  return api
    .post('/auth/register/', { full_name: fullName, email, password })
    .then((res) => res.data)
}

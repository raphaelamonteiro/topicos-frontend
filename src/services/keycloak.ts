/**
 * Configuração de autenticação Keycloak para o Frontend
 * Keycloak URL: http://localhost:9080
 * Realm: demo
 * ClientId: frontend (conforme registrado no realm-export.json)
 */
export const keycloakConfig = {
  url: 'http://localhost:9080',
  realm: 'demo',
  clientId: 'frontend',
}

/**
 * Função utilitária para obter token JWT via Direct Access Grant (Password Flow)
 * Útil para testes rápidos, integração e chamadas autenticadas na API (porta 8080).
 *
 * Usuários cadastrados no Keycloak (realm-export.json):
 * - appadmin / pass123 (Role: admin)
 * - appuser / pass123  (Role: user)
 */
export async function obterTokenKeycloak(username = 'appadmin', password = 'pass123'): Promise<string> {
  const params = new URLSearchParams()
  params.append('grant_type', 'password')
  params.append('client_id', keycloakConfig.clientId)
  params.append('username', username)
  params.append('password', password)

  const response = await fetch(`${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    throw new Error(`Falha ao autenticar no Keycloak: ${response.statusText}`)
  }

  const data = await response.json()
  return data.access_token
}

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import {
  getPostAuthenticationRedirect,
  getPostProfileRedirect,
  getProtectedRouteDestination,
} from '../src/app/protectedRouteNavigation.ts'

describe('protected route return destination', () => {
  test('restores a protected route after login and preserves its query and hash', () => {
    const destination = { pathname: '/sessions/abc', search: '?from=invite', hash: '#details' }
    assert.deepEqual(getProtectedRouteDestination(destination), destination)
    assert.deepEqual(getPostAuthenticationRedirect({ from: destination }, false), {
      to: destination,
      replace: true,
    })
  })

  test('keeps the protected route through profile completion', () => {
    const destination = { pathname: '/sessions/abc', search: '', hash: '' }
    const afterLogin = getPostAuthenticationRedirect({ from: destination }, true)
    assert.deepEqual(afterLogin, {
      to: '/complete-profile',
      replace: true,
      state: { from: destination },
    })
    assert.deepEqual(getPostProfileRedirect(afterLogin.state), {
      to: destination,
      replace: true,
    })
  })

  test('keeps the existing root destination for normal login and profile completion', () => {
    assert.deepEqual(getPostAuthenticationRedirect(null, false), { to: '/', replace: true })
    const afterLogin = getPostAuthenticationRedirect(null, true)
    assert.deepEqual(afterLogin, { to: '/complete-profile', replace: true })
    assert.deepEqual(getPostProfileRedirect(afterLogin.state), { to: '/', replace: true })
  })

  test('rejects external, malformed and non-protected return targets', () => {
    for (const pathname of [
      'https://example.com',
      'http://example.com',
      '//example.com/path',
      'javascript:alert(1)',
      '/\\\\example.com/path',
      '/sessions/%2f%2fexample.com',
      '/unknown/path',
    ]) {
      assert.equal(getProtectedRouteDestination({ pathname, search: '', hash: '' }), null, pathname)
      assert.deepEqual(getPostAuthenticationRedirect({ from: { pathname } }, false), {
        to: '/',
        replace: true,
      })
    }
  })
})

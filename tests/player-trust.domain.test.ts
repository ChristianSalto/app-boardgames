import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createPlayerReviewRecord,
  isValidReviewRating,
  maximumReviewCommentLength,
  normalizeReviewComment,
} from '../src/player-trust/domain/playerReview.ts'
import { serializeReviewIdentity } from '../src/player-trust/domain/reviewId.ts'
import { createSha256ReviewId } from '../src/player-trust/infrastructure/inMemoryPlayerTrust.ts'

const validInput = {
  sessionId: 'session-1',
  reviewerId: 'reviewer-1',
  reviewedPlayerId: 'reviewed-1',
  rating: 5,
}

test('rating is valid only from 1 through 5 as an integer', () => {
  assert.equal(isValidReviewRating(1), true)
  assert.equal(isValidReviewRating(5), true)
  assert.equal(isValidReviewRating(0), false)
  assert.equal(isValidReviewRating(5.5), false)
  assert.equal(isValidReviewRating(6), false)
})

test('comments are normalized and bounded without storing an empty value', () => {
  assert.equal(normalizeReviewComment('  Una mesa estupenda.  '), 'Una mesa estupenda.')
  assert.equal(normalizeReviewComment('   '), undefined)
  const tooLong = createPlayerReviewRecord({ ...validInput, comment: 'x'.repeat(maximumReviewCommentLength + 1) }, 'id', '2026-01-01T00:00:00.000Z')
  assert.deepEqual(tooLong, { kind: 'invalid', reason: 'comment-too-long' })
})

test('a player cannot review themselves', () => {
  const result = createPlayerReviewRecord(
    { ...validInput, reviewedPlayerId: validInput.reviewerId },
    'id',
    '2026-01-01T00:00:00.000Z',
  )
  assert.deepEqual(result, { kind: 'invalid', reason: 'self-review' })
})

test('review identity has unambiguous canonical JSON serialization and lowercase SHA-256', async () => {
  const identity = { sessionId: 'session-1', reviewerId: 'reviewer-1', reviewedPlayerId: 'reviewed-1' }
  assert.equal(serializeReviewIdentity(identity), '["session-1","reviewer-1","reviewed-1"]')
  assert.equal(await createSha256ReviewId(identity), 'b6169c9dfc517d6bf3b620e62f1c1dfbe1ac582301ad62a8bf9a761563b7bc2b')
})

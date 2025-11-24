/**
 * Auth Middleware Tests
 * Tests authentication and authorization logic
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import authUser from '../../middleware/Auth.js';
import jwt from 'jsonwebtoken';
import { createMockRequest, createMockResponse, createMockNext } from '../setup.js';

// Mock logger
jest.mock('../../utils/logger.js', () => ({
  default: {
    error: jest.fn()
  }
}));

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    next = createMockNext();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('Valid Token', () => {
    it('should call next() when valid token is provided', async () => {
      const token = jwt.sign({ id: 'user123' }, process.env.JWT_SECRET);
      req.headers.token = token;

      await authUser(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.body.userId).toBe('user123');
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should attach userId to req.body', async () => {
      const token = jwt.sign({ id: 'user456' }, process.env.JWT_SECRET);
      req.headers.token = token;

      await authUser(req, res, next);

      expect(req.body.userId).toBe('user456');
    });
  });

  describe('Invalid Token', () => {
    it('should return 401 when token is missing', async () => {
      req.headers.token = undefined;

      await authUser(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized login again!'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', async () => {
      req.headers.token = 'invalid-token';

      await authUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token is expired', async () => {
      const expiredToken = jwt.sign(
        { id: 'user123' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );
      req.headers.token = expiredToken;

      await authUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token is tampered', async () => {
      const token = jwt.sign({ id: 'user123' }, process.env.JWT_SECRET);
      const tamperedToken = token.slice(0, -5) + 'XXXXX';
      req.headers.token = tamperedToken;

      await authUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token has wrong secret', async () => {
      const token = jwt.sign({ id: 'user123' }, 'wrong-secret');
      req.headers.token = token;

      await authUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Security', () => {
    it('should not expose sensitive information in error messages', async () => {
      req.headers.token = 'invalid-token';

      await authUser(req, res, next);

      const response = res.json.mock.calls[0][0];
      expect(response.message).not.toContain('secret');
      expect(response.message).not.toContain('JWT');
    });

    it('should handle missing JWT_SECRET gracefully', async () => {
      delete process.env.JWT_SECRET;
      const token = jwt.sign({ id: 'user123' }, 'some-secret');
      req.headers.token = token;

      await authUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});


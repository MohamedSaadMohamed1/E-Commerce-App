import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/auth/register (POST)', () => {
    it('should register a new user', () => {
      const randomEmail = `user${Date.now()}@example.com`;
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: randomEmail,
          password: 'Password123!',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('access_token');
          expect(res.body.user.email).toBe(randomEmail);
        });
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'Password123!',
        })
        .expect(400);
    });

    it('should fail with weak password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'weak',
        })
        .expect(400);
    });

    it('should fail with short name', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'AB',
          email: 'test@example.com',
          password: 'Password123!',
        })
        .expect(400);
    });
  });

  describe('/api/auth/login (POST)', () => {
    const testUser = {
      name: 'Login Test User',
      email: `logintest${Date.now()}@example.com`,
      password: 'Password123!',
    };

    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('access_token');
          expect(res.body.user.email).toBe(testUser.email);
        });
    });

    it('should fail with invalid password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should fail with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        })
        .expect(401);
    });
  });

  describe('/api/auth/profile (GET)', () => {
    let accessToken: string;

    beforeAll(async () => {
      const randomEmail = `profile${Date.now()}@example.com`;
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Profile Test User',
          email: randomEmail,
          password: 'Password123!',
        });

      accessToken = response.body.access_token;
    });

    it('should get user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('name');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should fail without authorization header', () => {
      return request(app.getHttpServer()).get('/api/auth/profile').expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});

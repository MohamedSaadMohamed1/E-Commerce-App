import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/enums/user-role.enum';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: UserRole.CUSTOMER,
    isActive: true,
    validatePassword: jest.fn(),
  };

  const mockUsersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a user', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      };

      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('test-token');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe('test-token');
      expect(usersService.create).toHaveBeenCalledWith({
        ...registerDto,
        role: UserRole.CUSTOMER,
      });
    });
  });

  describe('login', () => {
    it('should successfully login a user', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      mockUser.validatePassword.mockResolvedValue(true);
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('test-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe('test-token');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const inactiveUser = { ...mockUser, isActive: false };
      mockUsersService.findByEmail.mockResolvedValue(inactiveUser);
      inactiveUser.validatePassword = jest.fn().mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      mockUser.validatePassword.mockResolvedValue(true);
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      const result = await service.validateUser(
        'test@example.com',
        'Password123!',
      );

      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException for user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.validateUser('notfound@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for incorrect password', async () => {
      mockUser.validatePassword.mockResolvedValue(false);
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.validateUser('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});

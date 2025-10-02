using Microsoft.AspNetCore.Identity;
using MusicEventManagementSystem.API.Services.IServices.Auth;
using MusicEventManagementSystem.Core.Models.DTOs.Auth;
using MusicEventManagementSystem.Core.Models.Entities.Auth;

namespace MusicEventManagementSystem.API.Services.Auth
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        
        public AuthService(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            try
            {
                var existingUser = await _userManager.FindByEmailAsync(registerDto.Email);

                if (existingUser != null)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "User with this email already exists."
                    };
                }

                var user = new ApplicationUser
                {
                    UserName = registerDto.Email,
                    Email = registerDto.Email,
                    FirstName = registerDto.FirstName,
                    LastName = registerDto.LastName,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true,
                    Department = registerDto.Department
                };

                var result = await _userManager.CreateAsync(user, registerDto.Password);
            
                if (result.Succeeded)
                {
                    var userDto = new UserDto
                    {
                        Id = user.Id,
                        Email = user.Email!,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        CreatedAt = user.CreatedAt,
                        IsActive = user.IsActive,
                        Department = user.Department
                    };

                    return new AuthResponseDto
                    {
                        Success = true,
                        Message = "User registered successfully.",
                        User = userDto
                    };
                }

                return new AuthResponseDto
                {
                    Success = false,
                    Message = string.Join(", ", result.Errors.Select(e => e.Description))
                };
            }
            catch (Exception ex)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = $"Error while registering: {ex.Message}"
                };
            }
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(loginDto.Email);

                if (user == null)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "User not found."
                    };
                }

                var result = await _signInManager.PasswordSignInAsync(user, loginDto.Password, false, false);

                if (result.Succeeded)
                {
                    var userDto = new UserDto
                    {
                        Id = user.Id,
                        Email = user.Email!,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        CreatedAt = user.CreatedAt,
                        IsActive = user.IsActive,
                        Department = user.Department
                    };

                    return new AuthResponseDto
                    {
                        Success = true,
                        Message = "User logged in successfully.",
                        User = userDto
                    };
                }

                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid login credentials. Please check your email and password."
                };
            }
            catch (Exception ex)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = $"Error while logging in: {ex.Message}"
                };
            }
        }

        public async Task<UserDto?> GetUserByIdAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return null;
            }

            return new UserDto
            {
                Id = user.Id,
                Email = user.Email!,
                FirstName = user.FirstName,
                LastName = user.LastName,
                CreatedAt = user.CreatedAt,
                IsActive = user.IsActive,
                Department = user.Department
            };
        }
    }
}

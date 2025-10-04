using Microsoft.AspNetCore.Identity;
using MusicEventManagementSystem.Core.Interfaces.Services.Auth;
using MusicEventManagementSystem.Core.Models.DTOs.Auth;
using MusicEventManagementSystem.Core.Models.Entities.Auth;

namespace MusicEventManagementSystem.TicketSales.API.Services.Auth
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IJwtTokenService _jwtTokenService;

        public AuthService(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, IJwtTokenService jwtTokenService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtTokenService = jwtTokenService;
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

                if (!result.Succeeded)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = string.Join(", ", result.Errors.Select(e => e.Description))
                    };
                }

                // Assign role based on department
                string departmentRole = registerDto.Department switch
                {
                    Core.Enums.Auth.Department.Administrator => "Administrator",
                    Core.Enums.Auth.Department.TicketSales => "TicketSales",
                    Core.Enums.Auth.Department.EventOrganization => "EventOrganization",
                    Core.Enums.Auth.Department.ArtistCommunication => "ArtistCommunication",
                    Core.Enums.Auth.Department.MediaCampaign => "MediaCampaign",
                    Core.Enums.Auth.Department.MEMSClient => "MEMSClient",
                    _ => "MEMSClient" // Default
                };

                await _userManager.AddToRoleAsync(user, departmentRole);

                // Generate JWT token
                var roles = await _userManager.GetRolesAsync(user);
                var token = _jwtTokenService.GenerateToken(user, roles);

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
                    Token = token,
                    User = userDto,
                    Roles = roles.ToList()
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

                if (!result.Succeeded)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Invalid email or password."
                    };
                }

                // Generate JWT token
                var roles = await _userManager.GetRolesAsync(user);
                var token = _jwtTokenService.GenerateToken(user, roles);

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
                    Token = token,
                    User = userDto,
                    Roles = roles.ToList()
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

        public async Task<bool> LogoutAsync()
        {
            await _signInManager.SignOutAsync();
            return true;
        }
    }
}

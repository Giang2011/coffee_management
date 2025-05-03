<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Laravel\Sanctum\HasApiTokens;

class UserController extends Controller
{
    //
        
    public function register(Request $request)
    {
        

        $validated = $request->validate([
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'full_name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:15', // Thêm số điện thoại
            // 'security_question' => 'required|string|max:255', // Câu hỏi bảo mật
            // 'answer' => 'required|string|max:255', // Câu trả lời bảo mật
        ]);

        $user = User::create([
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'full_name' => $validated['full_name'],
            'phone_number' => $validated['phone_number'], // Lưu số điện thoại
            // 'security_question' => $validated['security_question'], // Lưu câu hỏi bảo mật
            // 'answer' => $validated['answer'], // Lưu câu trả lời bảo mật
        ]);

        return response()->json(['message' => 'User registered successfully', 
        'user' => $user->makeHidden(['password'])], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = Auth::user();
        if (!$user instanceof User) {
            return response()->json(['message' => 'User not found'], 404);
        }
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['message' => 'Login successful', 'token' => $token, 'user' => $user]);
    }

    public function getUser(Request $request)
    {
        return response()->json($request->user());
    }

    
    public function updateUser(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'nullable|string|max:255',
            'password' => 'nullable|min:6',
            'phone_number' => 'nullable|string|max:15',
            'sex' => 'nullable|in:Male,Female,Other', // Giới tính
            'birth_date' => 'nullable|date', // Ngày sinh
            'address' => 'nullable|string|max:255', // Địa chỉ
            'security_question' => 'nullable|string|max:255', // Câu hỏi bảo mật
            'answer' => 'nullable|string|max:255', // Câu trả lời bảo mật
        ]);

        $user = $request->user();

        // Mã hóa mật khẩu nếu có
        if (isset($validated['password'])) {
            $validated['password'] = bcrypt($validated['password']);
        }

        // Cập nhật thông tin người dùng
        $user->update($validated);

        return response()->json(['message' => 'User updated successfully', 'user' => $user]);
    }
    
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }
//     public function test(Request $request)
// {
//     return response()->json([
//         'user_id' => $request->user()->id,
//         'role' => $request->user()->role,
//     ]);
// }
}

#!/usr/bin/env python3
"""
Test file to demonstrate Code Runner extension
"""
import datetime

def greet():
    """Simple greeting function"""
    current_time = datetime.datetime.now()
    return f"Hello! Code Runner is working! Current time: {current_time.strftime('%Y-%m-%d %H:%M:%S')}"

def calculate_fibonacci(n):
    """Calculate fibonacci sequence"""
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

if __name__ == "__main__":
    print("🚀 Testing Code Runner Extension!")
    print("=" * 50)
    
    # Test greeting
    print(greet())
    
    # Test fibonacci
    print("\nFibonacci sequence (first 10 numbers):")
    for i in range(10):
        print(f"F({i}) = {calculate_fibonacci(i)}")
    
    # Test some math
    numbers = [1, 2, 3, 4, 5]
    squares = [x**2 for x in numbers]
    print(f"\nNumbers: {numbers}")
    print(f"Squares: {squares}")
    print(f"Sum of squares: {sum(squares)}")
    
    print("\n✅ Code Runner test completed successfully!")
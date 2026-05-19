$ErrorActionPreference = "Stop"

$adminEmail = "admin@example.com"
$adminPassword = "password123"
$baseUrl = "http://localhost:5000/api"
$workDir = "d:\4th year project\Placement Support Management System"

function Write-InfoMsg ($msg) { Write-Host "$msg" -ForegroundColor Green }
function Write-ErrorMsg ($msg) { Write-Host "ERROR: $msg" -ForegroundColor Red }
function Write-DebugMsg ($msg) { Write-Host "DEBUG: $msg" -ForegroundColor Gray }

try {
    Write-InfoMsg "1. Authenticating as Admin..."
    $loginBody = @{
        email    = $adminEmail
        password = $adminPassword
    } | ConvertTo-Json

    try {
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    }
    catch {
        Write-ErrorMsg "Login Failed: $($_.Exception.Message)"
        exit 1
    }

    $token = $loginResponse.token
    
    if (-not $token) {
        Write-ErrorMsg "Failed to get admin token"
        exit 1
    }
    Write-InfoMsg "   Admin Token Retrieved."

    # 2. Create Student
    $timestamp = Get-Date -Format "MMddHHmmss"
    $randomRoll = "SEC" + $timestamp
    Write-InfoMsg "2. Creating Student with Roll No: $randomRoll"
    
    # Construct Payload
    $studentData = @{
        name    = "Security Test Student"
        roll_no = $randomRoll
        email   = "test_$randomRoll@example.com"
        branch  = "CSE"
        year    = 4
        cgpa    = 8.5
        batch   = "2022-2026"
        status  = "Unplaced"
        skills  = @("Java", "Security")
    }
    $studentBody = $studentData | ConvertTo-Json -Depth 5
    
    # Save Payload
    $studentBody | Set-Content "$workDir\payload.json" -Encoding UTF8
    Write-InfoMsg "Payload saved to $workDir\payload.json"

    $headers = @{
        Authorization = "Bearer $token"
    }

    try {
        $createResponse = Invoke-RestMethod -Uri "$baseUrl/students/create" -Method Post -Body $studentBody -ContentType "application/json" -Headers $headers
        Write-DebugMsg "Create Response: $($createResponse | ConvertTo-Json -Depth 5)"
    }
    catch {
        Write-ErrorMsg "Create Student Failed: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $body = $reader.ReadToEnd()
             
            # Save Error Body
            $body | Set-Content "$workDir\error.txt" -Encoding UTF8
            Write-ErrorMsg "Full error response saved to $workDir\error.txt"
            Write-ErrorMsg "Error Body Preview: $body"
        }
        exit 1
    }
    
    $initialPassword = $createResponse.initialPassword
    if (-not $initialPassword) {
        Write-ErrorMsg "API did not return initialPassword!"
        exit 1
    }

    Write-InfoMsg "   Student Created."
    Write-InfoMsg "   Initial Password: $initialPassword"

    # 3. Verify Login with Roll No (Should Fail)
    Write-InfoMsg "3. Testing Login with RollNo (Expected Failure)..."
    try {
        $failBody = @{
            username = $randomRoll
            password = $randomRoll # Old insecure behavior
        } | ConvertTo-Json
        
        Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $failBody -ContentType "application/json"
        
        Write-ErrorMsg "CRITICAL: Login with RollNo SUCCEEDED! Vulnerability persists."
        exit 1
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 401 -or $statusCode -eq 400) {
            Write-InfoMsg "   Success: Login failed as expected (Status: $statusCode)"
        }
        else {
            Write-ErrorMsg "   Unexpected error: $($_.Exception.Message)"
            exit 1
        }
    }

    # 4. Verify Login with Initial Password (Should Success)
    Write-InfoMsg "4. Testing Login with Generated Password..."
    try {
        $successBody = @{
            username = $randomRoll
            password = $initialPassword
        } | ConvertTo-Json
        
        $null = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $successBody -ContentType "application/json"
        Write-InfoMsg "   Success: Login with Initial Password worked."
        Write-InfoMsg "VERIFICATION COMPLETE: Secure Password Onboarding is working!"
    }
    catch {
        Write-ErrorMsg "   Failed to login with generated password: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $body = $reader.ReadToEnd()
            Write-ErrorMsg "Response Body: $body"
        }
        exit 1
    }

}
catch {
    Write-ErrorMsg "Script Failed: $($_.Exception.Message)"
    exit 1
}

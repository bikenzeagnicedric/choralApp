const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Try to read .env.local
const envPath = path.resolve(__dirname, '../.env.local');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf8');
} catch (e) {
    console.error('Could not read .env.local. Please make sure it exists.');
    process.exit(1);
}

// Parse env vars manually to avoid dependency on dotenv
const envVars = {};
const lines = envContent.split(/\r?\n/); // Handle both CRLF and LF
lines.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) return; // Skip empty lines and comments

    const match = trimmedLine.match(/^([^=]+)=(.*)$/);
    if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        envVars[key] = value;
    }
});

console.log('Found keys:', Object.keys(envVars)); // Debugging help


const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createAdmin() {
    const email = 'admin@admin.com';
    const password = 'Qwerty123';

    console.log(`Creating user ${email}...`);

    // 1. Create User
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name: 'Default Admin'
        }
    });

    if (userError) {
        console.error('Error creating user:', userError.message);
        // If user already exists, we try to find them to update role
        if (userError.message.includes('already registered')) {
            console.log('User already exists, attempting to fetch and promote...');
            // We can't get the ID easily without signing in or using listUsers (which requires permissions)
            // But since we have service role, we can list users.
            const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
            if (listError) {
                console.error('Could not list users to find existing admin:', listError);
                return;
            }
            const existingUser = listData.users.find(u => u.email === email);
            if (existingUser) {
                await promoteToAdmin(existingUser.id);
            } else {
                console.error('Could not find user in list despite "already registered" error.');
            }
        }
        return;
    }

    console.log('User created successfully:', userData.user.id);
    await promoteToAdmin(userData.user.id);
}

async function promoteToAdmin(userId) {
    console.log(`Promoting user ${userId} to admin...`);

    // 2. Update Profile
    // We use upsert to handle both cases: profile exists or needs creation
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            role: 'admin',
            full_name: 'Default Admin',
            // We might want to preserve other fields if updating, but for a default admin script this is usually fine.
            // To be safer, we could just update the role if the record exists, but upsert is easier.
        }, { onConflict: 'id' })
        .select();

    if (profileError) {
        console.error('Error updating profile role:', profileError.message);
    } else {
        console.log('Success! User is now an admin.');
    }
}

createAdmin();

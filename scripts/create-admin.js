
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin(email, password, fullName) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      console.log('User created:', data.user.email);
      // Manually set the user's role to 'manager' in the profiles table
      const { error: profileError } = await supabase
        .from('perfiles')
        .update({ rol: 'manager' })
        .eq('id', data.user.id);

      if (profileError) throw profileError;

      console.log('User role updated to manager.');
      return { success: true };
    }

    return { success: false, error: 'Could not create admin user.' };
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    return { success: false, error: error.message };
  }
}

const argv = yargs(hideBin(process.argv))
  .option('email', {
    alias: 'e',
    description: 'The admin user\'s email address',
    type: 'string',
    demandOption: true,
  })
  .option('password', {
    alias: 'p',
    description: 'The admin user\'s password',
    type: 'string',
    demandOption: true,
  })
  .option('fullName', {
    alias: 'f',
    description: 'The admin user\'s full name',
    type: 'string',
    demandOption: true,
  })
  .help()
  .alias('help', 'h')
  .argv;

createAdmin(argv.email, argv.password, argv.fullName);

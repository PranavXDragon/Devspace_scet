import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';

export const seedAdmin = async () => {
  try {
    const { count, error: countError } = await supabase
      .from('admins')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error("Error checking admin count:", countError);
      return;
    }

    if (count === 0) {
      const defaultEmail = process.env.ADMIN_EMAIL || "admin@devspace.com";
      const defaultPassword = process.env.ADMIN_PASSWORD || "admin123";

      // Hash the password manually since Mongoose pre-save hook is gone
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const { error: insertError } = await supabase
        .from('admins')
        .insert([{
          name: "Admin",
          email: defaultEmail,
          password: hashedPassword,
        }]);

      if (insertError) {
        console.error("Error creating default admin:", insertError);
      } else {
        console.log(`Default admin created. Email: ${defaultEmail}`);
      }
    } else {
      console.log("Admin already exists, skipping seed.");
    }
  } catch (error) {
    console.error("Error seeding admin:", error);
  }
};

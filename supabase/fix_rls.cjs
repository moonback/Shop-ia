const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'init_database.sql');
let content = fs.readFileSync(filepath, 'utf8');

const is_admin_func = `
-- ─── is_admin : check if current user is admin (bypassing RLS to avoid infinite recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

if (!content.includes("CREATE OR REPLACE FUNCTION public.is_admin(")) {
    content = content.replace("-- ─── handle_new_user : profil", is_admin_func + "\n-- ─── handle_new_user : profil");
}

const pattern = /EXISTS\s*\(\s*SELECT 1 FROM (?:public\.)?profiles WHERE id = auth\.uid\(\)\s*AND\s*is_admin = true\s*\)/g;
content = content.replace(pattern, "public.is_admin()");

// Replace the specific problem in profiles itself just in case
// Sometimes people write it as:
// EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
// which we just replaced.

fs.writeFileSync(filepath, content, 'utf8');
console.log('Fixed RLS infinite recursion successfully!');

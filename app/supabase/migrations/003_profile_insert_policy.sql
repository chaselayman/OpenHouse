-- Add INSERT policy for profiles table
-- This allows users to create their own profile if the trigger fails

-- First, allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Also, re-create the trigger in case it wasn't applied
-- Drop existing trigger first (ignore error if doesn't exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- If you have existing users without profiles, run this to create them:
-- INSERT INTO public.profiles (id, email, full_name)
-- SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
-- FROM auth.users
-- WHERE id NOT IN (SELECT id FROM public.profiles);

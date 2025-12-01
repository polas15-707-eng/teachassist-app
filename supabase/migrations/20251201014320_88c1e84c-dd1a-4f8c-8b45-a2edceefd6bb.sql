-- Add RLS policy to allow users to insert their own role during registration
CREATE POLICY "Users can insert their own role during registration"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Insert missing role for existing test user
-- Note: This will only work if the user ID exists
INSERT INTO public.user_roles (user_id, role)
VALUES ('0e07fe41-fc11-4429-ad9f-5fb8222894a5', 'student')
ON CONFLICT (user_id, role) DO NOTHING;
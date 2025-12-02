-- Drop the restrictive INSERT policy and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Users can insert their own role during registration" ON public.user_roles;

-- Create PERMISSIVE policy for users to insert their own role
CREATE POLICY "Users can insert their own role during registration" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());
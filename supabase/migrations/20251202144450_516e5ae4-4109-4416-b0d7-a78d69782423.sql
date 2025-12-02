-- Add INSERT policy for users to create their own teacher record during registration
CREATE POLICY "Users can create their own teacher record" 
ON public.teachers 
FOR INSERT 
WITH CHECK (user_id = auth.uid());
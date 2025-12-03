-- Update the handle_new_user function to automatically handle role assignment and teacher creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role text;
  new_teacher_id text;
  teacher_count int;
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    new.email
  );

  -- Get role from metadata (default to 'student' if not provided)
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'student');

  -- Insert into user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, user_role::app_role);

  -- If teacher, create teacher record
  IF user_role = 'teacher' THEN
    -- Get current teacher count for ID generation
    SELECT COUNT(*) INTO teacher_count FROM public.teachers;
    new_teacher_id := 'T' || LPAD((teacher_count + 1)::text, 3, '0');
    
    INSERT INTO public.teachers (user_id, teacher_id, account_status)
    VALUES (new.id, new_teacher_id, 'Pending');
  END IF;

  RETURN new;
END;
$function$;
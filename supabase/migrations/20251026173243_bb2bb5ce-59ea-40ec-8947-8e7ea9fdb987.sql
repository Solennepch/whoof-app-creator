-- Enable RLS on categories_pro table
ALTER TABLE public.categories_pro ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read categories (public directory)
CREATE POLICY "Anyone can view categories"
  ON public.categories_pro
  FOR SELECT
  USING (true);

-- Only admins can modify categories
CREATE POLICY "Admins can insert categories"
  ON public.categories_pro
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update categories"
  ON public.categories_pro
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete categories"
  ON public.categories_pro
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
-- Activer RLS sur profiles (si pas déjà fait)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Permettre aux utilisateurs connectés de lire leur propre profil
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Permettre aux utilisateurs connectés de créer leur propre profil
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Permettre aux utilisateurs connectés de modifier leur propre profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

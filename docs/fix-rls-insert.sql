-- Politiques INSERT pour les tables métier
-- Les politiques FOR ALL USING existantes ne couvrent pas INSERT

CREATE POLICY "Clients insert"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = entreprise_id);

CREATE POLICY "Appareils insert"
  ON appareils FOR INSERT
  WITH CHECK (auth.uid() = entreprise_id);

CREATE POLICY "Devis insert"
  ON devis FOR INSERT
  WITH CHECK (auth.uid() = entreprise_id);

CREATE POLICY "Caisse insert"
  ON caisse FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

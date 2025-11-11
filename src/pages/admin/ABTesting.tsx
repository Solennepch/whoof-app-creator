import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, TrendingUp, Users } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ABTest {
  id: string;
  template_id: string;
  test_name: string;
  description?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

interface Variant {
  id: string;
  template_id: string;
  variant_name: string;
  subject: string;
  html_body: string;
  is_active: boolean;
}

interface Template {
  id: string;
  name: string;
  subject: string;
}

export default function ABTesting() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingTest, setCreatingTest] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [testName, setTestName] = useState("");
  const [testDescription, setTestDescription] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [testsRes, templatesRes, variantsRes] = await Promise.all([
        supabase.from("ab_tests").select("*").order("created_at", { ascending: false }),
        supabase.from("email_templates").select("id, name, subject"),
        supabase.from("email_template_variants").select("*"),
      ]);

      if (testsRes.error) throw testsRes.error;
      if (templatesRes.error) throw templatesRes.error;
      if (variantsRes.error) throw variantsRes.error;

      setTests(testsRes.data || []);
      setTemplates(templatesRes.data || []);
      setVariants(variantsRes.data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createVariant = async (templateId: string, variantName: string, subject: string, htmlBody: string) => {
    try {
      const { error } = await supabase.from("email_template_variants").insert({
        template_id: templateId,
        variant_name: variantName,
        subject,
        html_body: htmlBody,
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Variante créée avec succès",
      });

      await fetchData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createTest = async () => {
    if (!selectedTemplate || !testName) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive",
      });
      return;
    }

    setCreatingTest(true);
    try {
      // Get variants for the selected template
      const templateVariants = variants.filter(v => v.template_id === selectedTemplate && v.is_active);

      if (templateVariants.length < 2) {
        throw new Error("Au moins 2 variantes actives sont requises pour un test A/B");
      }

      const { error } = await supabase.from("ab_tests").insert({
        template_id: selectedTemplate,
        test_name: testName,
        description: testDescription,
        status: 'draft',
        variant_ids: templateVariants.map(v => v.id),
        traffic_split: templateVariants.reduce((acc, v, i) => ({
          ...acc,
          [v.variant_name]: Math.floor(100 / templateVariants.length)
        }), {}),
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Test A/B créé avec succès",
      });

      setTestName("");
      setTestDescription("");
      setSelectedTemplate("");
      await fetchData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreatingTest(false);
    }
  };

  const startTest = async (testId: string) => {
    try {
      const { error } = await supabase
        .from("ab_tests")
        .update({
          status: 'running',
          start_date: new Date().toISOString(),
        })
        .eq('id', testId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Test A/B démarré",
      });

      await fetchData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const stopTest = async (testId: string) => {
    try {
      const { error } = await supabase
        .from("ab_tests")
        .update({
          status: 'completed',
          end_date: new Date().toISOString(),
        })
        .eq('id', testId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Test A/B terminé",
      });

      await fetchData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tests A/B</h1>
        <p className="text-muted-foreground">Comparez les performances de vos templates</p>
      </div>

      {/* Create New Test */}
      <Card>
        <CardHeader>
          <CardTitle>Créer un nouveau test A/B</CardTitle>
          <CardDescription>
            Sélectionnez un template avec plusieurs variantes pour comparer leurs performances
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-name">Nom du test</Label>
              <Input
                id="test-name"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Test sujet court vs long"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnelle)</Label>
            <Textarea
              id="description"
              value={testDescription}
              onChange={(e) => setTestDescription(e.target.value)}
              placeholder="Objectif du test, hypothèse, etc."
              rows={3}
            />
          </div>

          <Button onClick={createTest} disabled={creatingTest}>
            {creatingTest ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Créer le test
          </Button>
        </CardContent>
      </Card>

      {/* Active Tests */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Tests en cours</h2>
        <div className="grid gap-4">
          {tests
            .filter((test) => test.status === 'running' || test.status === 'draft')
            .map((test) => (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{test.test_name}</CardTitle>
                      <CardDescription>{test.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {test.status === 'draft' && (
                        <Button onClick={() => startTest(test.id)}>
                          Démarrer
                        </Button>
                      )}
                      {test.status === 'running' && (
                        <Button variant="destructive" onClick={() => stopTest(test.id)}>
                          Terminer
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {variants
                      .filter((v) => v.template_id === test.template_id)
                      .map((variant) => (
                        <Card key={variant.id}>
                          <CardHeader>
                            <CardTitle className="text-base">
                              Variante {variant.variant_name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">{variant.subject}</p>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Completed Tests */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Tests terminés</h2>
        <div className="grid gap-4">
          {tests
            .filter((test) => test.status === 'completed')
            .map((test) => (
              <Card key={test.id}>
                <CardHeader>
                  <CardTitle>{test.test_name}</CardTitle>
                  <CardDescription>
                    {test.start_date && test.end_date &&
                      `Du ${new Date(test.start_date).toLocaleDateString()} au ${new Date(test.end_date).toLocaleDateString()}`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Cliquez sur le test pour voir les résultats détaillés
                  </p>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}

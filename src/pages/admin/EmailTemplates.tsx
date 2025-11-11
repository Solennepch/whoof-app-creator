import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_body: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function EmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates((data || []).map(t => ({
        ...t,
        variables: Array.isArray(t.variables) ? t.variables as string[] : []
      })));
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

  const handleSave = async () => {
    if (!editingTemplate) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("email_templates")
        .upsert({
          id: editingTemplate.id,
          name: editingTemplate.name,
          subject: editingTemplate.subject,
          html_body: editingTemplate.html_body,
          variables: editingTemplate.variables,
          is_active: editingTemplate.is_active,
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Template enregistré avec succès",
      });

      await fetchTemplates();
      setEditingTemplate(null);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce template ?")) return;

    try {
      const { error } = await supabase
        .from("email_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Template supprimé avec succès",
      });

      await fetchTemplates();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Templates d'emails</h1>
          <p className="text-muted-foreground">Gérez les templates d'emails pour les notifications</p>
        </div>
        <Button onClick={() => setEditingTemplate({
          id: crypto.randomUUID(),
          name: "",
          subject: "",
          html_body: "",
          variables: [],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau template
        </Button>
      </div>

      {editingTemplate ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingTemplate.id ? "Modifier" : "Créer"} le template
            </CardTitle>
            <CardDescription>
              Utilisez les variables entre accolades (ex: {`{{user_name}}`})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du template</Label>
              <Input
                id="name"
                value={editingTemplate.name}
                onChange={(e) =>
                  setEditingTemplate({ ...editingTemplate, name: e.target.value })
                }
                placeholder="booking_reminder"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Sujet de l'email</Label>
              <Input
                id="subject"
                value={editingTemplate.subject}
                onChange={(e) =>
                  setEditingTemplate({ ...editingTemplate, subject: e.target.value })
                }
                placeholder="🐾 Rappel de rendez-vous"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="html_body">Corps de l'email (HTML)</Label>
              <Textarea
                id="html_body"
                value={editingTemplate.html_body}
                onChange={(e) =>
                  setEditingTemplate({ ...editingTemplate, html_body: e.target.value })
                }
                rows={12}
                className="font-mono text-sm"
                placeholder="<div>...</div>"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={editingTemplate.is_active}
                onCheckedChange={(checked) =>
                  setEditingTemplate({ ...editingTemplate, is_active: checked })
                }
              />
              <Label htmlFor="is_active">Template actif</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Enregistrer
              </Button>
              <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{template.name}</span>
                  {template.is_active ? (
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                      Actif
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded">
                      Inactif
                    </span>
                  )}
                </CardTitle>
                <CardDescription>{template.subject}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingTemplate(template)}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

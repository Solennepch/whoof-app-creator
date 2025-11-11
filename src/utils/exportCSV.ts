/**
 * Utility functions for exporting data to CSV format
 */

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Headers row
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle null/undefined
        if (value === null || value === undefined) return '';
        // Handle arrays
        if (Array.isArray(value)) return `"${value.join('; ')}"`;
        // Handle objects
        if (typeof value === 'object') return `"${JSON.stringify(value)}"`;
        // Handle strings with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Add BOM for Excel UTF-8 support
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportUsersToCSV = (users: any[]) => {
  const formattedData = users.map(user => ({
    'ID': user.id,
    'Nom d\'affichage': user.display_name || '',
    'Ville': user.city || '',
    'Bio': user.bio || '',
    'Genre': user.gender || '',
    'Date de création': user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '',
    'Banni': user.is_banned ? 'Oui' : 'Non',
    'Raison du ban': user.ban_reason || '',
  }));

  exportToCSV(formattedData, `utilisateurs_${new Date().toISOString().split('T')[0]}`);
};

export const exportProfessionalsToCSV = (pros: any[]) => {
  const formattedData = pros.map(pro => ({
    'ID': pro.id,
    'Nom de l\'entreprise': pro.business_name,
    'Activité': pro.activity,
    'Email': pro.email || '',
    'Téléphone': pro.phone || '',
    'Ville': pro.city || '',
    'Site web': pro.website || '',
    'SIRET': pro.siret || '',
    'Vérifié': pro.verified ? 'Oui' : 'Non',
    'Publié': pro.is_published ? 'Oui' : 'Non',
    'Plan': pro.plan || 'Aucun',
    'Note moyenne': pro.rating_avg || 0,
    'Vues': pro.views_count || 0,
    'Clics': pro.clicks_count || 0,
    'Date de création': pro.created_at ? new Date(pro.created_at).toLocaleDateString('fr-FR') : '',
  }));

  exportToCSV(formattedData, `professionnels_${new Date().toISOString().split('T')[0]}`);
};

export const exportHoroscopesToCSV = (horoscopes: any[]) => {
  const formattedData = horoscopes.map(horo => ({
    'ID': horo.id,
    'Signe zodiacal': horo.zodiac_sign,
    'Semaine début': horo.week_start,
    'Semaine fin': horo.week_end,
    'Mood': horo.mood,
    'Actif': horo.is_active ? 'Oui' : 'Non',
    'Texte': horo.horoscope_text.substring(0, 100) + '...',
    'Date de publication': horo.published_at ? new Date(horo.published_at).toLocaleDateString('fr-FR') : 'Non publié',
    'Date de création': horo.created_at ? new Date(horo.created_at).toLocaleDateString('fr-FR') : '',
  }));

  exportToCSV(formattedData, `horoscopes_${new Date().toISOString().split('T')[0]}`);
};

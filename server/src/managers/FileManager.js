const fs = require('fs').promises;
const path = require('path');

/**
 * Gestionnaire de fichiers pour import/export
 */
class FileManager {
  constructor() {
    this.dataDir = path.join(__dirname, '../../data');
    this.sessionsDir = path.join(this.dataDir, 'sessions');
    this.exportsDir = path.join(this.dataDir, 'exports');
    
    this.ensureDirectories();
  }

  /**
   * Crée les dossiers nécessaires s'ils n'existent pas
   */
  async ensureDirectories() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      await fs.mkdir(this.sessionsDir, { recursive: true });
      await fs.mkdir(this.exportsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directories:', error);
    }
  }

  /**
   * Sauvegarde une session dans un fichier JSON
   * @param {string} sessionCode - Code de la session
   * @param {Object} sessionData - Données de la session
   * @returns {Promise<Object>} { success: boolean, filePath: string|null, error: string|null }
   */
  async saveSession(sessionCode, sessionData) {
    try {
      const fileName = `session-${sessionCode}-${Date.now()}.json`;
      const filePath = path.join(this.sessionsDir, fileName);
      
      const jsonData = JSON.stringify(sessionData, null, 2);
      await fs.writeFile(filePath, jsonData, 'utf8');
      
      console.log(`Session saved to file: ${fileName}`);
      
      return {
        success: true,
        filePath: filePath,
        fileName: fileName,
        error: null
      };
    } catch (error) {
      console.error('Error saving session:', error);
      return {
        success: false,
        filePath: null,
        fileName: null,
        error: error.message
      };
    }
  }

  /**
   * Charge une session depuis un fichier JSON
   * @param {string} fileName - Nom du fichier
   * @returns {Promise<Object>} { success: boolean, data: Object|null, error: string|null }
   */
  async loadSession(fileName) {
    try {
      const filePath = path.join(this.sessionsDir, fileName);
      const jsonData = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(jsonData);
      
      console.log(`Session loaded from file: ${fileName}`);
      
      return {
        success: true,
        data: data,
        error: null
      };
    } catch (error) {
      console.error('Error loading session:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  }

  /**
   * Liste toutes les sessions sauvegardées
   * @returns {Promise<Array>}
   */
  async listSavedSessions() {
    try {
      const files = await fs.readdir(this.sessionsDir);
      const sessionFiles = files.filter(f => f.startsWith('session-') && f.endsWith('.json'));
      
      const sessions = await Promise.all(
        sessionFiles.map(async (fileName) => {
          const filePath = path.join(this.sessionsDir, fileName);
          const stats = await fs.stat(filePath);
          
          try {
            const jsonData = await fs.readFile(filePath, 'utf8');
            const data = JSON.parse(jsonData);
            
            return {
              fileName: fileName,
              sessionCode: data.code,
              mode: data.mode,
              players: data.players.length,
              savedAt: stats.mtime,
              size: stats.size
            };
          } catch (error) {
            return {
              fileName: fileName,
              error: 'Could not parse file',
              savedAt: stats.mtime
            };
          }
        })
      );
      
      return sessions.sort((a, b) => b.savedAt - a.savedAt);
    } catch (error) {
      console.error('Error listing sessions:', error);
      return [];
    }
  }

  /**
   * Exporte les résultats finaux dans un fichier JSON
   * @param {string} sessionCode - Code de la session
   * @param {Object} resultsData - Données des résultats
   * @returns {Promise<Object>} { success: boolean, filePath: string|null, error: string|null }
   */
  async exportResults(sessionCode, resultsData) {
    try {
      const fileName = `results-${sessionCode}-${Date.now()}.json`;
      const filePath = path.join(this.exportsDir, fileName);
      
      const jsonData = JSON.stringify(resultsData, null, 2);
      await fs.writeFile(filePath, jsonData, 'utf8');
      
      console.log(`Results exported to file: ${fileName}`);
      
      return {
        success: true,
        filePath: filePath,
        fileName: fileName,
        error: null
      };
    } catch (error) {
      console.error('Error exporting results:', error);
      return {
        success: false,
        filePath: null,
        fileName: null,
        error: error.message
      };
    }
  }

  /**
   * Charge un backlog depuis un fichier JSON
   * @param {Buffer} fileBuffer - Buffer du fichier
   * @returns {Object} { success: boolean, data: Object|null, error: string|null }
   */
  parseBacklogFile(fileBuffer) {
    try {
      const jsonString = fileBuffer.toString('utf8');
      const data = JSON.parse(jsonString);
      
      return {
        success: true,
        data: data,
        error: null
      };
    } catch (error) {
      console.error('Error parsing backlog file:', error);
      return {
        success: false,
        data: null,
        error: 'Invalid JSON format'
      };
    }
  }

  /**
   * Supprime un fichier de session sauvegardée
   * @param {string} fileName - Nom du fichier
   * @returns {Promise<boolean>}
   */
  async deleteSession(fileName) {
    try {
      const filePath = path.join(this.sessionsDir, fileName);
      await fs.unlink(filePath);
      
      console.log(`Session file deleted: ${fileName}`);
      
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }

  /**
   * Nettoie les anciennes sessions (plus de 30 jours)
   * @returns {Promise<number>} Nombre de fichiers supprimés
   */
  async cleanOldSessions() {
    try {
      const files = await fs.readdir(this.sessionsDir);
      const now = Date.now();
      const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
      
      let deletedCount = 0;
      
      for (let fileName of files) {
        const filePath = path.join(this.sessionsDir, fileName);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime.getTime() < thirtyDaysAgo) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      }
      
      console.log(`Cleaned ${deletedCount} old session files`);
      
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning old sessions:', error);
      return 0;
    }
  }

  /**
   * Crée un fichier JSON téléchargeable
   * @param {Object} data - Données à convertir
   * @param {string} filename - Nom du fichier
   * @returns {Object} { content: string, mimeType: string, filename: string }
   */
  createDownloadableJSON(data, filename) {
    const jsonString = JSON.stringify(data, null, 2);
    
    return {
      content: jsonString,
      mimeType: 'application/json',
      filename: filename.endsWith('.json') ? filename : `${filename}.json`
    };
  }
}

const fileManager = new FileManager();

module.exports = fileManager;
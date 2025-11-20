const Feature = require('../models/Feature');
const { validateBacklog } = require('../utils/validators');
const { v4: uuidv4 } = require('uuid');

/**
 * Gestionnaire de backlog
 */
class BacklogManager {
  /**
   * Parse et valide un backlog JSON
   * @param {Object} backlogData - Données du backlog
   * @returns {Object} { success: boolean, features: Array|null, error: string|null }
   */
  parseBacklog(backlogData) {
    const validation = validateBacklog(backlogData);
    
    if (!validation.valid) {
      return {
        success: false,
        features: null,
        error: validation.errors.join(', ')
      };
    }

    const features = backlogData.features.map(featureData => {
      return new Feature(
        featureData.id || uuidv4(),
        featureData.name,
        featureData.description || ''
      );
    });

    return {
      success: true,
      features: features,
      error: null
    };
  }

  /**
   * Ajoute une fonctionnalité au backlog d'une session
   * @param {Session} session - Session concernée
   * @param {string} name - Nom de la fonctionnalité
   * @param {string} description - Description
   * @returns {Object} { success: boolean, feature: Feature|null, error: string|null }
   */
  addFeature(session, name, description = '') {
    if (!name || name.trim() === '') {
      return {
        success: false,
        feature: null,
        error: 'Feature name cannot be empty'
      };
    }

    const feature = new Feature(uuidv4(), name.trim(), description.trim());
    session.backlog.push(feature);

    console.log(`Feature added to session ${session.code}: ${name}`);

    return {
      success: true,
      feature: feature,
      error: null
    };
  }

  /**
   * Supprime une fonctionnalité du backlog
   * @param {Session} session - Session concernée
   * @param {string} featureId - ID de la fonctionnalité
   * @returns {boolean}
   */
  removeFeature(session, featureId) {
    const index = session.backlog.findIndex(f => f.id === featureId);
    
    if (index === -1) {
      return false;
    }

    if (index < session.currentFeatureIndex) {
      session.currentFeatureIndex--;
    }

    session.backlog.splice(index, 1);
    
    console.log(`Feature ${featureId} removed from session ${session.code}`);
    
    return true;
  }

  /**
   * Récupère toutes les fonctionnalités du backlog
   * @param {Session} session - Session concernée
   * @returns {Array}
   */
  getAllFeatures(session) {
    return session.backlog.map(f => f.toJSON());
  }

  /**
   * Récupère les fonctionnalités complétées
   * @param {Session} session - Session concernée
   * @returns {Array}
   */
  getCompletedFeatures(session) {
    return session.backlog
      .filter(f => f.completed)
      .map(f => f.toJSON());
  }

  /**
   * Récupère les fonctionnalités restantes
   * @param {Session} session - Session concernée
   * @returns {Array}
   */
  getRemainingFeatures(session) {
    return session.backlog
      .filter(f => !f.completed)
      .map(f => f.toJSON());
  }

  /**
   * Calcule la progression du backlog
   * @param {Session} session - Session concernée
   * @returns {Object}
   */
  getProgress(session) {
    const total = session.backlog.length;
    const completed = session.backlog.filter(f => f.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total: total,
      completed: completed,
      remaining: total - completed,
      percentage: percentage,
      currentIndex: session.currentFeatureIndex
    };
  }

  /**
   * Réordonne les fonctionnalités du backlog
   * @param {Session} session - Session concernée
   * @param {Array} newOrder - Tableau des IDs dans le nouvel ordre
   * @returns {boolean}
   */
  reorderFeatures(session, newOrder) {
    if (newOrder.length !== session.backlog.length) {
      return false;
    }

    const reorderedBacklog = [];
    
    for (let id of newOrder) {
      const feature = session.backlog.find(f => f.id === id);
      if (!feature) {
        return false;
      }
      reorderedBacklog.push(feature);
    }

    session.backlog = reorderedBacklog;
    
    console.log(`Backlog reordered for session ${session.code}`);
    
    return true;
  }

  /**
   * Clone un backlog pour une nouvelle session
   * @param {Array} features - Features à cloner
   * @returns {Array}
   */
  cloneBacklog(features) {
    return features.map(f => {
      return new Feature(
        uuidv4(),
        f.name,
        f.description
      );
    });
  }
}

const backlogManager = new BacklogManager();

module.exports = backlogManager;
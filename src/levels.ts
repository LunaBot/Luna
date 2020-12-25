export class LevelManager {
    static Equate(experience: number) {
      return Math.floor(experience + 300 * Math.pow(2, experience / 7));
    }
  
    static LevelToExperience(level: number) {
      let experience = 0;
      for (let i = 1; i < level; i++) experience += this.Equate(i);
      return Math.floor(experience / 4);
    }
  
    static ExperienceToLevel(experience: number) {
      let level = 0;
      while (LevelManager.LevelToExperience(level) < experience) level++;
      return level;
    }
};

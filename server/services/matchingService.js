/**
 * Project Partner Finder — Deterministic & Explainable Matching Engine
 * 
 * Formula:
 * Match Score =
 *   0.45 × Skill Match +
 *   0.20 × Role Match +
 *   0.15 × Interest Match +
 *   0.10 × Availability Match +
 *   0.10 × Experience Match
 */

const PROFICIENCY_WEIGHTS = {
  'Beginner': 0.5,
  'Intermediate': 0.75,
  'Advanced': 0.9,
  'Expert': 1.0
};

const calculateMatchScore = (user, project) => {
  const reasons = [];

  // 1. Skill Match (45%)
  const userSkillsMap = new Map();
  if (Array.isArray(user.skills)) {
    user.skills.forEach(s => {
      userSkillsMap.set(s.name.toLowerCase().trim(), s.proficiency || 'Intermediate');
    });
  }

  const reqSkills = project.requiredSkills || [];
  let matchedSkillsCount = 0;
  let totalSkillWeight = 0;
  const matchedSkillNames = [];

  if (reqSkills.length > 0) {
    reqSkills.forEach(reqSkill => {
      const lowerReq = reqSkill.toLowerCase().trim();
      if (userSkillsMap.has(lowerReq)) {
        matchedSkillsCount++;
        const prof = userSkillsMap.get(lowerReq);
        totalSkillWeight += (PROFICIENCY_WEIGHTS[prof] || 0.75);
        matchedSkillNames.push(reqSkill);
      }
    });

    // Score based on percentage of required skills matched + average proficiency
    const matchRatio = matchedSkillsCount / reqSkills.length;
    const avgProficiency = matchedSkillsCount > 0 ? (totalSkillWeight / matchedSkillsCount) : 0;
    var skillScore = Math.min(100, Math.round((matchRatio * 0.7 + avgProficiency * 0.3) * 100));

    if (matchedSkillNames.length > 0) {
      reasons.push(`Strong match on required skills: ${matchedSkillNames.slice(0, 3).join(', ')}`);
    }
  } else {
    var skillScore = 80; // default baseline if no explicit skills required
  }

  // 2. Role Match (20%)
  const userRoles = (user.preferredRoles || []).map(r => r.toLowerCase().trim());
  const projectRoles = (project.requiredRoles || []).map(r => r.title.toLowerCase().trim());
  
  let roleMatched = false;
  let matchedRoleName = '';
  if (projectRoles.length > 0 && userRoles.length > 0) {
    for (let pRole of projectRoles) {
      for (let uRole of userRoles) {
        if (pRole.includes(uRole) || uRole.includes(pRole)) {
          roleMatched = true;
          matchedRoleName = uRole;
          break;
        }
      }
      if (roleMatched) break;
    }
    var roleScore = roleMatched ? 100 : 30;
    if (roleMatched) {
      reasons.push(`Preferred role matches open project role (${matchedRoleName})`);
    }
  } else {
    var roleScore = 70;
  }

  // 3. Interest Match (15%)
  const userInterests = (user.interests || []).concat(user.projectPreferences || []).map(i => i.toLowerCase().trim());
  const projectType = (project.type || '').toLowerCase().trim();
  const projectCategory = (project.category || '').toLowerCase().trim();

  let interestMatchCount = 0;
  userInterests.forEach(interest => {
    if (projectType.includes(interest) || interest.includes(projectType) ||
        projectCategory.includes(interest) || interest.includes(projectCategory)) {
      interestMatchCount++;
    }
  });

  var interestScore = interestMatchCount > 0 ? Math.min(100, 60 + interestMatchCount * 20) : 50;
  if (interestMatchCount > 0) {
    reasons.push(`Aligned project interests in ${project.category || project.type}`);
  }

  // 4. Availability Match (10%)
  const userAvail = (user.availability || '10-15 hrs/week').toLowerCase();
  const projAvail = (project.availability || '10-15 hrs/week').toLowerCase();
  
  var availabilityScore = userAvail === projAvail ? 100 : 75;
  if (userAvail === projAvail) {
    reasons.push(`Matching weekly availability (${user.availability})`);
  }

  // 5. Experience Match (10%)
  const userExp = user.experienceLevel || 'Intermediate';
  var experienceScore = 80;
  if (userExp === 'Advanced' || userExp === 'Expert') experienceScore = 100;
  else if (userExp === 'Intermediate') experienceScore = 85;
  else experienceScore = 70;
  reasons.push(`Relevant ${userExp} experience level`);

  // Calculate Weighted Total Score
  const totalScore = Math.round(
    0.45 * skillScore +
    0.20 * roleScore +
    0.15 * interestScore +
    0.10 * availabilityScore +
    0.10 * experienceScore
  );

  return {
    matchScore: Math.min(99, Math.max(10, totalScore)),
    matchBreakdown: {
      skillScore,
      roleScore,
      interestScore,
      availabilityScore,
      experienceScore
    },
    reasons
  };
};

module.exports = {
  calculateMatchScore
};

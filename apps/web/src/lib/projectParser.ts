/**
 * Project Parser Utility
 * 
 * Parses installation photo filenames to extract project information
 * and groups photos by project for dynamic gallery display.
 * 
 * Expected filename format:
 * [Customer Name] [City] [State] [System Size] [Install Date] [optional number].extension
 * 
 * Example: "Cole Hendrix Fithian IL 4.05kW Jun 2025.jpeg"
 */

export interface ProjectPhoto {
  filename: string;
  path: string;
  customerName: string;
  city: string;
  state: string;
  systemSize: string;
  installDate: string;
  photoNumber?: string;
  extension: string;
}

export interface GroupedProject {
  id: string;
  customerName: string;
  city: string;
  state: string;
  systemSize: string;
  installDate: string;
  location: string;
  photos: ProjectPhoto[];
  mainPhoto: ProjectPhoto;
  additionalPhotos: ProjectPhoto[];
}

/**
 * Parse a filename to extract project information
 */
export function parsePhotoFilename(filename: string): ProjectPhoto | null {
  try {
    // Remove the file extension
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
    const extension = filename.substring(filename.lastIndexOf('.'));
    
    // Regex pattern to match the naming convention
    // Matches: [First Name] [Last Name] [City (can be multi-word)] [State] [Size] [Date] [optional number]
    const pattern = /^(\w+\s+\w+)\s+(.+?)\s+(IL|Illinois)\s+(\d+(?:\.\d+)?)\s*kW\s+(Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|September|Oct|October|Nov|November|Dec|December)\s+(\d{4})(?:\s+(\d+))?$/i;
    
    const match = nameWithoutExt.match(pattern);
    
    if (!match) {
      console.warn(`Failed to parse filename: ${filename}`);
      return null;
    }
    
    const [, customerName, city, state, sizeNumber, month, year, photoNumber] = match;
    const systemSize = `${sizeNumber}kW`;
    
    return {
      filename,
      path: `/${filename}`,
      customerName: customerName.trim(),
      city: city.trim(),
      state: state.trim(),
      systemSize: systemSize.trim(),
      installDate: `${month} ${year}`,
      photoNumber: photoNumber || undefined,
      extension
    };
  } catch (error) {
    console.error(`Error parsing filename ${filename}:`, error);
    return null;
  }
}

/**
 * Group photos by project
 */
export function groupPhotosByProject(photos: ProjectPhoto[]): GroupedProject[] {
  const projectMap = new Map<string, ProjectPhoto[]>();
  
  // Group photos by project identifier
  photos.forEach(photo => {
    const projectId = `${photo.customerName}_${photo.city}_${photo.state}_${photo.systemSize}_${photo.installDate}`;
    
    if (!projectMap.has(projectId)) {
      projectMap.set(projectId, []);
    }
    
    projectMap.get(projectId)!.push(photo);
  });
  
  // Convert to GroupedProject array
  const groupedProjects: GroupedProject[] = [];
  
  projectMap.forEach((projectPhotos, projectId) => {
    if (projectPhotos.length === 0) return;
    
    // Sort photos - main photo (without number) first, then by number
    projectPhotos.sort((a, b) => {
      if (!a.photoNumber && b.photoNumber) return -1;
      if (a.photoNumber && !b.photoNumber) return 1;
      if (a.photoNumber && b.photoNumber) {
        return parseInt(a.photoNumber) - parseInt(b.photoNumber);
      }
      return 0;
    });
    
    const mainPhoto = projectPhotos[0];
    const additionalPhotos = projectPhotos.slice(1);
    
    groupedProjects.push({
      id: projectId.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      customerName: mainPhoto.customerName,
      city: mainPhoto.city,
      state: mainPhoto.state,
      systemSize: mainPhoto.systemSize,
      installDate: mainPhoto.installDate,
      location: `${mainPhoto.city}, ${mainPhoto.state}`,
      photos: projectPhotos,
      mainPhoto,
      additionalPhotos
    });
  });
  
  // Sort projects by date (most recent first)
  groupedProjects.sort((a, b) => {
    const dateA = new Date(`${a.installDate} 01`);
    const dateB = new Date(`${b.installDate} 01`);
    return dateB.getTime() - dateA.getTime();
  });
  
  return groupedProjects;
}

/**
 * Get all project photos from the public directory
 * This simulates reading the public directory - in a real implementation,
 * you might use a different approach to get the file list
 */
export function getAllProjectPhotos(): ProjectPhoto[] {
  // List of installation photos based on the file structure
  const photoFilenames = [
    'Carole Lawyer Stewardson IL 7.38kW July 2025 2.JPG',
    'Carole Lawyer Stewardson IL 7.38kW July 2025 3.jpg',
    'Carole Lawyer Stewardson IL 7.38kW July 2025.jpg',
    'Cole Hendrix Fithian IL 4.05kW Jun 2025 2.JPEG',
    'Cole Hendrix Fithian IL 4.05kW Jun 2025 3.jpg',
    'Cole Hendrix Fithian IL 4.05kW Jun 2025.jpeg',
    'Fred Gant Du Quoin IL 13.28 kW Jan 2025 2.JPEG',
    'Fred Gant Du Quoin IL 13.28 kW Jan 2025 3.jpg',
    'Fred Gant Du Quoin IL 13.28 kW Jan 2025.jpeg',
    'Kimberly Payne Georgetown IL 10.94kW July 2025 2.jpg',
    'Kimberly Payne Georgetown IL 10.94kW July 2025.jpg',
    'Neil Custer Wood River IL 17.22 kW Dec 2024 2.jpeg',
    'Neil Custer Wood River IL 17.22 kW Dec 2024.jpeg'
  ];
  
  const parsedPhotos: ProjectPhoto[] = [];
  
  photoFilenames.forEach(filename => {
    const parsed = parsePhotoFilename(filename);
    if (parsed) {
      parsedPhotos.push(parsed);
    }
  });
  
  return parsedPhotos;
}

/**
 * Calculate estimated annual savings based on system size
 */
export function calculateEstimatedSavings(systemSize: string): string {
  const sizeMatch = systemSize.match(/(\d+(?:\.\d+)?)/);
  if (!sizeMatch) return '$0';
  
  const kw = parseFloat(sizeMatch[1]);
  // Estimate ~$145 savings per kW in Illinois
  const annualSavings = Math.round(kw * 145);
  
  return `$${annualSavings.toLocaleString()}`;
}

/**
 * Generate project descriptions based on system details
 */
export function generateProjectDescription(project: GroupedProject): string {
  const systemSizeNum = parseFloat(project.systemSize.match(/(\d+(?:\.\d+)?)/)?.[1] || '0');
  
  let description = `Professional solar installation in ${project.location} featuring a ${project.systemSize} system. `;
  
  if (systemSizeNum >= 15) {
    description += 'Large-scale residential installation with high-efficiency panels designed for maximum energy production. ';
  } else if (systemSizeNum >= 10) {
    description += 'Comprehensive solar solution with premium panels and advanced monitoring capabilities. ';
  } else if (systemSizeNum >= 7) {
    description += 'Mid-size installation optimized for excellent energy production and cost savings. ';
  } else {
    description += 'Compact, efficient solar system designed to maximize available roof space. ';
  }
  
  description += 'Complete system includes professional installation, monitoring, and comprehensive warranty coverage.';
  
  return description;
}

/**
 * Get project tags based on system characteristics
 */
export function generateProjectTags(project: GroupedProject): string[] {
  const tags: string[] = ['Residential', 'Illinois Install'];
  const systemSizeNum = parseFloat(project.systemSize.match(/(\d+(?:\.\d+)?)/)?.[1] || '0');
  
  // Add size-based tags
  if (systemSizeNum >= 15) {
    tags.push('Large System');
  } else if (systemSizeNum >= 10) {
    tags.push('Premium Install');
  } else {
    tags.push('Efficient Design');
  }
  
  // Add date-based tags
  const installYear = project.installDate.split(' ')[1];
  if (installYear === '2025') {
    tags.push('Recent Install');
  }
  
  // Add location-based tags
  if (project.city.toLowerCase().includes('chicago') || project.city.toLowerCase().includes('aurora') || project.city.toLowerCase().includes('naperville')) {
    tags.push('Chicagoland');
  } else {
    tags.push('Downstate IL');
  }
  
  return tags;
}

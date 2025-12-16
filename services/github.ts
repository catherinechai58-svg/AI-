
interface GithubFile {
  path: string;
  type: string;
  url: string; // Blob url
}

export const fetchGithubRepo = async (repoUrl: string): Promise<{ name: string; content: string }> => {
  // Regex to extract owner and repo from URL
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    throw new Error("Invalid GitHub URL. Please use format: https://github.com/owner/repo");
  }
  const owner = match[1];
  const repo = match[2].replace(/\.git$/, '');

  try {
    // 1. Get Repo Info to find default branch
    const repoInfoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    if (!repoInfoRes.ok) {
        if (repoInfoRes.status === 403) throw new Error("GitHub API rate limit exceeded. Please try again later.");
        if (repoInfoRes.status === 404) throw new Error("Repository not found.");
        throw new Error("Failed to fetch repository info.");
    }
    const repoInfo = await repoInfoRes.json();
    const defaultBranch = repoInfo.default_branch;

    // 2. Get File Tree (Recursive)
    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`);
    if (!treeRes.ok) throw new Error("Failed to fetch repository file tree.");
    const treeData = await treeRes.json();

    // 3. Filter Files 
    // We strictly filter for text-based source files to analyze logic and structure.
    const allowedExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.h', '.cs', 
      '.go', '.rs', '.php', '.rb', '.md', '.json', '.txt', '.html', '.css', 
      '.sql', '.yml', '.yaml', '.toml'
    ];
    
    // We limit to 15 files to avoid hitting GitHub API rate limits (60/hr for unauthenticated)
    // and to keep context focused. We prioritize files closer to root by path length usually, 
    // but here we just take the first ones in the tree that match.
    const files = (treeData.tree as GithubFile[])
        .filter(file => file.type === 'blob' && allowedExtensions.some(ext => file.path.endsWith(ext)))
        .slice(0, 15);

    if (files.length === 0) {
        throw new Error("No supported text/code files found in this repository.");
    }

    // 4. Fetch File Contents
    const filePromises = files.map(async (file) => {
        const blobRes = await fetch(file.url);
        if (!blobRes.ok) return null;
        const blobData = await blobRes.json();
        
        // GitHub API returns content in Base64. We need to decode it correctly for UTF-8.
        try {
            const content = new TextDecoder().decode(
                Uint8Array.from(atob(blobData.content.replace(/\n/g, '')), c => c.charCodeAt(0))
            );
            return {
                path: file.path,
                content: content
            };
        } catch (e) {
            return null; // Skip if encoding fails
        }
    });

    const results = await Promise.all(filePromises);
    
    let combinedContent = `Source: GitHub Repository\nRepo: ${owner}/${repo}\nUrl: ${repoUrl}\n\n`;
    
    let successCount = 0;
    results.forEach(res => {
        if (res) {
            successCount++;
            combinedContent += `\n=== START OF FILE: ${res.path} ===\n`;
            combinedContent += res.content;
            combinedContent += `\n=== END OF FILE: ${res.path} ===\n`;
        }
    });

    if (successCount === 0) {
        throw new Error("Failed to read file contents.");
    }

    return {
        name: `${owner}/${repo} (GitHub)`,
        content: combinedContent
    };

  } catch (error: any) {
    console.error("GitHub Fetch Error:", error);
    throw new Error(error.message || "Failed to analyze GitHub repository.");
  }
};

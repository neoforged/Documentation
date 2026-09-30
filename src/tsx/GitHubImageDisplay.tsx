import React from "react";

export default function GitHubImageDisplay({repository, branch, path, clazz, alt}: {repository: string, branch: string, path: string, clazz: string, alt: string}) {
    return (
        <div class="display-image">
            <img src={`https://raw.githubusercontent.com/${repository}/refs/heads/${branch}/${path}`} decoding="async" loading="lazy" className={clazz} alt={alt}/>
        </div>
    );
}

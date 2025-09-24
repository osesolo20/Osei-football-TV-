/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type } from "@google/genai";

// Ensure the API key is available.
if (!process.env.API_KEY) {
  const feed = document.getElementById('commentary-feed') as HTMLElement;
  if (feed) {
    feed.innerHTML = `<div class="commentary-message ai-message">Error: API_KEY environment variable not set. Please configure your API key to use the app.</div>`;
  }
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Generic football icon SVG used as a placeholder
const PLACEHOLDER_ICON_SVG = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNlMGUwZTAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxwYXRoIGQ9Ik0xMiAyTDguNSAzLjVMMTAgNy40bC00LjYgMi4xTDQgMTJsMS40IDQuNWw0LjYgMi4xTDEwIDE2LjZMMTEuNSAyMC41TDEyIDIyVjIiLz48cGF0aCBkPSJtMTIgMiAxLjUgMS41TDExLjUgNy40bDQuNiAyLjFMMjAgMTJsLTEuNCA0LjVMMTQgMTguN2wtMS41LTMuMUwxMiAyMiIvPjwvc3ZnPg==';

// App containers
const preMatchSetupView = document.getElementById('prematch-setup') as HTMLElement;
const liveBroadcastView = document.getElementById('live-broadcast-view') as HTMLElement;

// Commentary feed elements
const commentaryFeed = document.getElementById('commentary-feed') as HTMLElement;
const promptForm = document.getElementById('prompt-form') as HTMLFormElement;
const promptInput = document.getElementById('prompt-input') as HTMLInputElement;
const submitButton = document.getElementById('submit-button') as HTMLButtonElement;

// Highlights elements
const highlightReel = document.getElementById('highlight-reel') as HTMLElement;
const highlightsPlaceholder = document.getElementById('highlights-placeholder') as HTMLParagraphElement;
const autoplayToggle = document.getElementById('autoplay-toggle') as HTMLInputElement;

// Stats elements
const statsUI = {
    homeTeamName: document.getElementById('stats-home-team') as HTMLElement,
    awayTeamName: document.getElementById('stats-away-team') as HTMLElement,
    homeTeamName2: document.getElementById('stats-home-team-2') as HTMLElement,
    awayTeamName2: document.getElementById('stats-away-team-2') as HTMLElement,
    possessionHomeValue: document.getElementById('possession-home-value') as HTMLElement,
    possessionAwayValue: document.getElementById('possession-away-value') as HTMLElement,
    possessionHomeBar: document.getElementById('possession-home-bar') as HTMLElement,
    possessionAwayBar: document.getElementById('possession-away-bar') as HTMLElement,
    shotsHomeValue: document.getElementById('shots-home-value') as HTMLElement,
    shotsAwayValue: document.getElementById('shots-away-value') as HTMLElement,
    foulsHomeValue: document.getElementById('fouls-home-value') as HTMLElement,
    foulsAwayValue: document.getElementById('fouls-away-value') as HTMLElement,
};

// Summary elements
const summaryContainer = document.getElementById('summary-container') as HTMLElement;
const summaryContent = document.getElementById('summary-content') as HTMLElement;

// Broadcast UI elements
const broadcastUI = {
  homeTeamDisplay: document.getElementById('home-team-display') as HTMLElement,
  awayTeamDisplay: document.getElementById('away-team-display') as HTMLElement,
  scoreDisplay: document.getElementById('score-display') as HTMLElement,
  homeTeamLogo: document.getElementById('home-team-logo') as HTMLImageElement,
  awayTeamLogo: document.getElementById('away-team-logo') as HTMLImageElement,
  matchInfo: document.getElementById('match-info') as HTMLElement,
  liveIndicator: document.getElementById('live-indicator') as HTMLElement,
  matchTimerDisplay: document.getElementById('match-timer-display') as HTMLElement,
};

// Score form elements
const scoreForm = document.getElementById('score-form') as HTMLFormElement;
const toggleScoreFormButton = document.getElementById('toggle-score-form-button') as HTMLButtonElement;
const scoreInputs = {
  homeTeam: document.getElementById('home-team-input') as HTMLInputElement,
  homeScore: document.getElementById('home-score-input') as HTMLInputElement,
  homePrimaryColor: document.getElementById('home-primary-color-input') as HTMLInputElement,
  homeSecondaryColor: document.getElementById('home-secondary-color-input') as HTMLInputElement,
  awayTeam: document.getElementById('away-team-input') as HTMLInputElement,
  awayScore: document.getElementById('away-score-input') as HTMLInputElement,
  awayPrimaryColor: document.getElementById('away-primary-color-input') as HTMLInputElement,
  awaySecondaryColor: document.getElementById('away-secondary-color-input') as HTMLInputElement,
  matchInfo: document.getElementById('match-info-input') as HTMLInputElement,
};
const logoPreviews = {
    home: document.getElementById('home-team-logo-preview') as HTMLImageElement,
    away: document.getElementById('away-team-logo-preview') as HTMLImageElement,
}

// Player tracking elements
const playerTrackForm = document.getElementById('player-track-form') as HTMLFormElement;
const playerTrackInput = document.getElementById('player-track-input') as HTMLInputElement;
const trackingInfo = document.getElementById('tracking-info') as HTMLElement;
const trackedPlayerName = document.getElementById('tracked-player-name') as HTMLElement;
const clearTrackingButton = document.getElementById('clear-tracking-button') as HTMLButtonElement;

// Team selector labels for dynamic updates
const teamSelectorLabels = {
    home: document.getElementById('team-selector-home-label') as HTMLLabelElement,
    away: document.getElementById('team-selector-away-label') as HTMLLabelElement,
}

// Save/Load Match elements
const saveMatchButton = document.getElementById('save-match-button') as HTMLButtonElement;
const finishMatchButton = document.getElementById('finish-match-button') as HTMLButtonElement;
const savedMatchesList = document.getElementById('saved-matches-list') as HTMLUListElement;
const noSavedMatches = document.getElementById('no-saved-matches') as HTMLParagraphElement;
const matchReportBar = document.getElementById('match-report-bar') as HTMLElement;
const startNewMatchButton = document.getElementById('start-new-match-button') as HTMLButtonElement;

// Camera elements
const cameraButton = document.getElementById('camera-button') as HTMLButtonElement;
const cameraModal = document.getElementById('camera-modal') as HTMLElement;
const cameraFeed = document.getElementById('camera-feed') as HTMLVideoElement;
const closeCameraButton = document.getElementById('close-camera-button') as HTMLButtonElement;
const capturePhotoButton = document.getElementById('capture-photo-button') as HTMLButtonElement;
const toggleRecordButton = document.getElementById('toggle-record-button') as HTMLButtonElement;
const switchCameraButton = document.getElementById('switch-camera-button') as HTMLButtonElement;
const cameraPreview = document.getElementById('camera-preview') as HTMLElement;
const photoPreview = document.getElementById('photo-preview') as HTMLImageElement;
const videoPreview = document.getElementById('video-preview') as HTMLVideoElement;
const retakeMediaButton = document.getElementById('retake-media-button') as HTMLButtonElement;
const useMediaButton = document.getElementById('use-media-button') as HTMLButtonElement;
const mediaPreviewContainer = document.getElementById('media-preview-container') as HTMLElement;
const mediaPreviewThumbnail = document.getElementById('media-preview-thumbnail') as HTMLImageElement;
const removeMediaButton = document.getElementById('remove-media-button') as HTMLButtonElement;


// App State
type CommentaryMessage = { text: string; type: 'ai' | 'user' | 'system'; options: { sources?: any[]; team?: 'home' | 'away' | 'neutral', media?: { data: string, mimeType: string } }; };
type Highlight = { id: number; prompt: string; status: 'loading' | 'done' | 'error'; videoData?: string; error?: string };
type CapturedMedia = { data: string; mimeType: string; } | null;

let currentScore = { home: 0, away: 0 };
let trackedPlayer: string | null = null;
let isAutoplayEnabled = true;
let matchStats = {
    possession: { home: 50, away: 50 },
    shotsOnTarget: { home: 0, away: 0 },
    fouls: { home: 0, away: 0 },
};
let commentaryHistory: CommentaryMessage[] = [];
let highlightsHistory: Highlight[] = [];
let isViewingSavedMatch = false;
let isMatchFinished = false;
let matchSummary: string | null = null;
let elapsedSeconds = 0;
let matchTimerInterval: number | null = null;
const SAVED_MATCHES_KEY = 'oseiFootballTVSavedMatches';
let highlightIdCounter = 0;
let capturedMedia: CapturedMedia = null;
let cameraStream: MediaStream | null = null;
let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let tempCapturedMedia: CapturedMedia = null;
let currentFacingMode = 'environment';


/**
 * Adds a new message to the commentary feed and state history.
 */
function addMessage(text: string, type: 'ai' | 'user' | 'system', options: CommentaryMessage['options'] = {}, fromHistory = false) {
    if (!fromHistory) {
        commentaryHistory.push({ text, type, options });
    }

    const messageElement = document.createElement('div');
    messageElement.classList.add('commentary-message', `${type}-message`);

    if (type === 'user' && options.team) {
        if (options.team === 'home') messageElement.classList.add('home-supporter');
        if (options.team === 'away') messageElement.classList.add('away-supporter');
    }

    // Basic markdown for bolding
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    let contentHTML = formattedText;
    
    if (options.media) {
        const mediaElement = options.media.mimeType.startsWith('image/')
            ? `<img src="${options.media.data}" alt="User provided media">`
            : `<video src="${options.media.data}" controls playsinline></video>`;
        
        contentHTML += `<div class="media-attachment">${mediaElement}</div>`;
    }

    messageElement.innerHTML = contentHTML;

    if (options.sources) {
        const sourcesElement = document.createElement('div');
        sourcesElement.classList.add('grounding-sources');
        sourcesElement.innerHTML = '<strong>Sources:</strong><ol>' +
            options.sources.map(source => `<li><a href="${source.web.uri}" target="_blank" rel="noopener noreferrer">${source.web.title}</a></li>`).join('') +
            '</ol>';
        messageElement.appendChild(sourcesElement);
    }

    commentaryFeed.appendChild(messageElement);
    commentaryFeed.scrollTop = commentaryFeed.scrollHeight;
}

/**
 * Creates a placeholder for a new highlight in the UI.
 */
function addHighlight(prompt: string): { highlightElement: HTMLElement; id: number; } {
    highlightsPlaceholder.classList.add('hidden');

    const highlightElement = document.createElement('div');
    highlightElement.classList.add('highlight-item', 'loading');

    const id = ++highlightIdCounter;
    highlightElement.dataset.highlightId = String(id);
    highlightElement.innerHTML = `
        <div class="loader"></div>
        <p class="highlight-status">Generating video for: "${prompt}"</p>
        <video controls playsinline class="hidden"></video>
        <p class="highlight-error hidden"></p>
    `;

    highlightsHistory.push({ id, prompt, status: 'loading' });
    highlightReel.prepend(highlightElement);
    return { highlightElement, id };
}

/**
 * Updates a highlight element with the generated video or an error message.
 */
function updateHighlight(id: number, status: 'done' | 'error', data?: string) {
    const highlightElement = document.querySelector(`[data-highlight-id='${id}']`) as HTMLElement;
    const highlightInHistory = highlightsHistory.find(h => h.id === id);

    if (!highlightElement || !highlightInHistory) return;

    highlightInHistory.status = status;
    highlightElement.classList.remove('loading');

    const loader = highlightElement.querySelector('.loader') as HTMLElement;
    const statusP = highlightElement.querySelector('.highlight-status') as HTMLElement;
    loader.style.display = 'none';
    statusP.classList.add('hidden');

    if (status === 'done' && data) {
        highlightInHistory.videoData = data;
        const video = highlightElement.querySelector('video') as HTMLVideoElement;
        video.src = data;
        video.classList.remove('hidden');
        if (isAutoplayEnabled) {
            video.play().catch(e => console.error("Autoplay failed:", e));
        }
    } else if (status === 'error') {
        highlightInHistory.error = data;
        const errorP = highlightElement.querySelector('.highlight-error') as HTMLElement;
        errorP.textContent = data || 'An unknown error occurred.';
        errorP.classList.remove('hidden');
    }
}


/**
 * Generates team logos using the Gemini API.
 */
async function generateAndUpdateLogo(teamName: string, previewElement: HTMLImageElement, finalElement: HTMLImageElement) {
    if (!teamName) {
        previewElement.src = PLACEHOLDER_ICON_SVG;
        finalElement.src = PLACEHOLDER_ICON_SVG;
        return;
    }
    previewElement.classList.add('loading');
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `A modern, minimalist, circular logo for a football team named "${teamName}". The logo should be on a transparent background.`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
            },
        });
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
        previewElement.src = imageUrl;
        finalElement.src = imageUrl;
    } catch (error) {
        console.error("Error generating logo:", error);
        previewElement.src = PLACEHOLDER_ICON_SVG;
        finalElement.src = PLACEHOLDER_ICON_SVG;
    } finally {
        previewElement.classList.remove('loading');
    }
}

/**
 * Converts a Blob to a base64 data URL string.
 */
function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Generates a video highlight based on a prompt.
 */
async function generateVideo(prompt: string, highlightId: number) {
    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: { numberOfVideos: 1 }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
            const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
            const videoBlob = await response.blob();
            const videoDataUrl = await blobToBase64(videoBlob);
            updateHighlight(highlightId, 'done', videoDataUrl);
        } else {
            throw new Error('Video generation did not return a valid download link.');
        }
    } catch (error) {
        console.error('Error generating video:', error);
        updateHighlight(highlightId, 'error', 'Failed to generate video.');
    }
}


/**
 * Core function to generate commentary and highlights based on user prompt.
 */
async function generateCommentaryAndHighlights(prompt: string, media?: CapturedMedia) {
    const team = (document.querySelector('input[name="team-selector"]:checked') as HTMLInputElement).value as 'home' | 'away' | 'neutral';
    addMessage(prompt, 'user', { team, media: media || undefined });
    setLoading(true);

    try {
        const systemInstruction = `You are Osei, a world-class football commentator.
            Your commentary is insightful, concise, and exciting.
            Analyze the user's description and any provided image or video of the on-pitch action.
            The current score is ${scoreInputs.homeTeam.value} ${currentScore.home} - ${currentScore.away} ${scoreInputs.awayTeam.value}.
            The match is in the ${broadcastUI.matchInfo.textContent}.
            ${trackedPlayer ? `You are currently hyper-focused on ${trackedPlayer}. Mention them prominently.` : ''}
            Your response must be a JSON object with this exact schema:
            {
                "commentary": string, // Your expert commentary on the action.
                "isSignificant": boolean, // Is this a goal, red card, or major event?
                "significantEventDescription": string | null, // If significant, describe it for a video generation model (e.g., "A stunning bicycle kick from 20 yards out finds the top corner").
                "statsUpdate": {
                    "possession": {"home": number, "away": number}, // Must sum to 100
                    "shotsOnTarget": {"home": number, "away": number}, // Incremental change
                    "fouls": {"home": number, "away": number} // Incremental change
                }
            }`;

        const parts: any[] = [{ text: prompt }];
        if (media) {
            parts.push({
                inlineData: {
                    mimeType: media.mimeType,
                    data: media.data.split(',')[1] // remove the data URL prefix
                }
            });
        }
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
            },
        });

        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);

        addMessage(data.commentary, 'ai');
        updateMatchStats(data.statsUpdate);

        if (data.isSignificant && data.significantEventDescription) {
            const { id } = addHighlight(data.significantEventDescription);
            generateVideo(`Action-packed, 5-second, 4k cinematic shot of a professional football match: ${data.significantEventDescription}`, id);
        }
    } catch (error) {
        console.error("Error generating commentary:", error);
        addMessage("Sorry, I couldn't generate a response. Please try again.", 'ai');
    } finally {
        setLoading(false);
    }
}

/**
 * Updates the match statistics based on the AI's analysis.
 */
function updateMatchStats(update: any) {
    if (!update) return;

    if (update.possession && update.possession.home + update.possession.away === 100) {
        matchStats.possession = update.possession;
    }
    if (update.shotsOnTarget) {
        matchStats.shotsOnTarget.home += update.shotsOnTarget.home || 0;
        matchStats.shotsOnTarget.away += update.shotsOnTarget.away || 0;
    }
    if (update.fouls) {
        matchStats.fouls.home += update.fouls.home || 0;
        matchStats.fouls.away += update.fouls.away || 0;
    }
    updateStatsUI();
}

/**
 * Updates the scoreboard and team colors in the UI.
 */
function updateScoreboard() {
    // Update team names and scores
    broadcastUI.homeTeamDisplay.textContent = scoreInputs.homeTeam.value || 'HOME';
    broadcastUI.awayTeamDisplay.textContent = scoreInputs.awayTeam.value || 'AWAY';
    broadcastUI.scoreDisplay.textContent = `${currentScore.home} - ${currentScore.away}`;
    broadcastUI.matchInfo.textContent = scoreInputs.matchInfo.value;

    // Update stats panel team names
    statsUI.homeTeamName.textContent = scoreInputs.homeTeam.value.substring(0, 4).toUpperCase() || 'HOME';
    statsUI.awayTeamName.textContent = scoreInputs.awayTeam.value.substring(0, 4).toUpperCase() || 'AWAY';
    statsUI.homeTeamName2.textContent = scoreInputs.homeTeam.value.substring(0, 4).toUpperCase() || 'HOME';
    statsUI.awayTeamName2.textContent = scoreInputs.awayTeam.value.substring(0, 4).toUpperCase() || 'AWAY';

    // Update team selector labels
    teamSelectorLabels.home.textContent = scoreInputs.homeTeam.value || 'HOME';
    teamSelectorLabels.away.textContent = scoreInputs.awayTeam.value || 'AWAY';

    // Update CSS variables for team colors
    document.documentElement.style.setProperty('--home-primary-color', scoreInputs.homePrimaryColor.value);
    document.documentElement.style.setProperty('--home-secondary-tint', `${scoreInputs.homeSecondaryColor.value}33`); // Add alpha for tint
    document.documentElement.style.setProperty('--away-primary-color', scoreInputs.awayPrimaryColor.value);
    document.documentElement.style.setProperty('--away-secondary-tint', `${scoreInputs.awaySecondaryColor.value}33`);
}

/**
 * Updates the statistics panel in the UI.
 */
function updateStatsUI() {
    statsUI.possessionHomeValue.textContent = `${matchStats.possession.home}%`;
    statsUI.possessionAwayValue.textContent = `${matchStats.possession.away}%`;
    statsUI.possessionHomeBar.style.width = `${matchStats.possession.home}%`;
    statsUI.possessionAwayBar.style.width = `${matchStats.possession.away}%`;

    statsUI.shotsHomeValue.textContent = String(matchStats.shotsOnTarget.home);
    statsUI.shotsAwayValue.textContent = String(matchStats.shotsOnTarget.away);

    statsUI.foulsHomeValue.textContent = String(matchStats.fouls.home);
    statsUI.foulsAwayValue.textContent = String(matchStats.fouls.away);
}

/**
 * Sets the loading state of the main prompt form.
 */
function setLoading(isLoading: boolean) {
    promptInput.disabled = isLoading;
    submitButton.disabled = isLoading;
    cameraButton.disabled = isLoading;
    if (isLoading) {
        submitButton.innerHTML = '<div class="loader"></div>';
    } else {
        submitButton.textContent = 'Send';
    }
}

// --- Timer Functions ---

/** Stops the match timer interval. */
function stopTimer() {
    if (matchTimerInterval) {
        clearInterval(matchTimerInterval);
        matchTimerInterval = null;
    }
}

/** Updates the timer display in the UI. */
function updateTimerUI(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const displaySeconds = seconds % 60;
    broadcastUI.matchTimerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`;
}

/** Starts the match timer. */
function startTimer() {
    stopTimer(); // Ensure no multiple timers are running
    elapsedSeconds = 0;
    updateTimerUI(elapsedSeconds);
    matchTimerInterval = window.setInterval(() => {
        elapsedSeconds++;
        updateTimerUI(elapsedSeconds);
    }, 1000);
}

// --- Summary, Save, and Load Functions ---

/**
 * Generates a summary of the match commentary.
 */
async function generateMatchSummary() {
    summaryContainer.classList.remove('hidden');
    summaryContent.innerHTML = '<div class="loader"></div>';

    const commentaryText = commentaryHistory
        .filter(msg => msg.type === 'ai')
        .map(msg => msg.text)
        .join('\n');

    if (!commentaryText) {
        matchSummary = "No commentary was generated for this match.";
        summaryContent.textContent = matchSummary;
        return;
    }

    const prompt = `Based on the following football match commentary, provide a concise summary of the key events, highlights, and the final result. The final score was ${scoreInputs.homeTeam.value} ${currentScore.home} - ${currentScore.away} ${scoreInputs.awayTeam.value}.

    Commentary:
    ${commentaryText}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        matchSummary = response.text.trim();
        summaryContent.textContent = matchSummary;
    } catch (error) {
        console.error("Error generating summary:", error);
        matchSummary = "Could not generate match summary.";
        summaryContent.textContent = matchSummary;
    }
}

/**
 * Saves the current match state to localStorage.
 */
function saveMatch() {
    const savedMatches = getSavedMatches();
    const matchData = {
        id: Date.now(),
        savedAt: new Date().toISOString(),
        teams: {
            home: {
                name: scoreInputs.homeTeam.value,
                logoSrc: broadcastUI.homeTeamLogo.src,
                primaryColor: scoreInputs.homePrimaryColor.value,
                secondaryColor: scoreInputs.homeSecondaryColor.value,
            },
            away: {
                name: scoreInputs.awayTeam.value,
                logoSrc: broadcastUI.awayTeamLogo.src,
                primaryColor: scoreInputs.awayPrimaryColor.value,
                secondaryColor: scoreInputs.awaySecondaryColor.value,
            }
        },
        score: currentScore,
        matchInfo: scoreInputs.matchInfo.value,
        stats: matchStats,
        commentary: commentaryHistory,
        highlights: highlightsHistory,
        isFinished: isMatchFinished,
        summary: matchSummary,
        elapsedSeconds: elapsedSeconds,
    };
    savedMatches.push(matchData);
    localStorage.setItem(SAVED_MATCHES_KEY, JSON.stringify(savedMatches));
    addMessage('Match progress saved.', 'system');
    renderSavedMatchesList();
}

/**
 * Retrieves all saved matches from localStorage.
 */
function getSavedMatches() {
    const saved = localStorage.getItem(SAVED_MATCHES_KEY);
    return saved ? JSON.parse(saved) : [];
}

/**
 * Populates the list of saved matches in the setup UI.
 */
function renderSavedMatchesList() {
    const savedMatches = getSavedMatches();
    savedMatchesList.innerHTML = '';
    noSavedMatches.classList.toggle('hidden', savedMatches.length > 0);

    savedMatches.reverse().forEach((match: any) => { // reverse to show newest first
        const li = document.createElement('li');
        const date = new Date(match.savedAt).toLocaleString();
        li.innerHTML = `
            <span><strong>${match.teams.home.name} vs ${match.teams.away.name}</strong><br><small>${date}</small></span>
            <div>
                <button class="load-match-button" data-match-id="${match.id}">Load</button>
                <button class="delete-match-button" data-match-id="${match.id}">Del</button>
            </div>
        `;
        savedMatchesList.appendChild(li);
    });
}

/**
 * Loads a selected match from storage and restores the application state.
 */
function loadMatch(matchId: number) {
    const savedMatches = getSavedMatches();
    const matchData = savedMatches.find((m: any) => m.id === matchId);
    if (!matchData) {
        alert('Could not find saved match.');
        return;
    }

    // Restore state
    isViewingSavedMatch = true;
    isMatchFinished = matchData.isFinished || false;
    matchSummary = matchData.summary || null;
    elapsedSeconds = matchData.elapsedSeconds || 0; // Set elapsedSeconds before updating the view

    scoreInputs.homeTeam.value = matchData.teams.home.name;
    scoreInputs.homePrimaryColor.value = matchData.teams.home.primaryColor;
    scoreInputs.homeSecondaryColor.value = matchData.teams.home.secondaryColor;
    scoreInputs.awayTeam.value = matchData.teams.away.name;
    scoreInputs.awayPrimaryColor.value = matchData.teams.away.primaryColor;
    scoreInputs.awaySecondaryColor.value = matchData.teams.away.secondaryColor;
    scoreInputs.homeScore.value = matchData.score.home;
    scoreInputs.awayScore.value = matchData.score.away;
    scoreInputs.matchInfo.value = matchData.matchInfo;
    
    currentScore = matchData.score;
    matchStats = matchData.stats;
    commentaryHistory = matchData.commentary;
    highlightsHistory = matchData.highlights;
    broadcastUI.homeTeamLogo.src = matchData.teams.home.logoSrc;
    broadcastUI.awayTeamLogo.src = matchData.teams.away.logoSrc;

    // Update UI from restored state
    updateScoreboard();
    updateStatsUI();
    renderAllFromHistory();
    updateViewForMatchState();
    
    preMatchSetupView.classList.add('hidden');
    liveBroadcastView.classList.remove('hidden');
}

/**
 * Deletes a saved match from localStorage.
 */
function deleteMatch(matchId: number) {
    let savedMatches = getSavedMatches();
    savedMatches = savedMatches.filter((m: any) => m.id !== matchId);
    localStorage.setItem(SAVED_MATCHES_KEY, JSON.stringify(savedMatches));
    renderSavedMatchesList();
}

/**
 * Clears and re-renders the commentary and highlights from history arrays.
 */
function renderAllFromHistory() {
    commentaryFeed.innerHTML = '';
    commentaryHistory.forEach(msg => addMessage(msg.text, msg.type, msg.options, true));

    highlightReel.innerHTML = '';
    highlightsHistory.forEach(createHighlightElementFromHistory);
    highlightsPlaceholder.classList.toggle('hidden', highlightsHistory.length > 0);
}

/**
 * Creates and appends a single highlight element from a history object.
 */
function createHighlightElementFromHistory(highlight: Highlight) {
    const { id, prompt, status, videoData, error } = highlight;
    const highlightElement = document.createElement('div');
    highlightElement.classList.add('highlight-item');
    highlightElement.dataset.highlightId = String(id);

    let content = '';
    if (status === 'loading') {
        highlightElement.classList.add('loading');
        content = `
            <div class="loader"></div>
            <p class="highlight-status">Generating video for: "${prompt}"</p>
        `;
    } else if (status === 'done' && videoData) {
        content = `<video src="${videoData}" controls playsinline></video>`;
    } else if (status === 'error') {
        content = `<p class="highlight-error">${error || 'Failed to generate highlight.'}</p>`;
    }
    highlightElement.innerHTML = content;
    highlightReel.prepend(highlightElement);
}

/**
 * Toggles UI elements based on the match state (live, finished, or saved).
 */
function updateViewForMatchState() {
    const isReadOnly = isViewingSavedMatch || isMatchFinished;

    // Handle timer and LIVE indicator based on match state
    if (isReadOnly) {
        stopTimer(); // Pause the timer
        broadcastUI.liveIndicator.classList.add('hidden'); // Ensure LIVE is hidden
        updateTimerUI(elapsedSeconds); // Ensure timer displays the final recorded duration
    } else {
        broadcastUI.liveIndicator.classList.remove('hidden'); // Ensure LIVE is shown for active matches
    }

    // Show/hide other UI elements based on the mode
    matchReportBar.classList.toggle('hidden', !isViewingSavedMatch);
    promptForm.classList.toggle('hidden', isReadOnly);
    playerTrackForm.classList.toggle('hidden', isReadOnly);
    finishMatchButton.classList.toggle('hidden', isReadOnly);
    (document.getElementById('ticker-wrap') as HTMLElement).classList.toggle('hidden', isReadOnly);
    (document.getElementById('controls-bar') as HTMLElement).style.justifyContent = isReadOnly ? 'center' : 'space-between';

    // "Save Match" is available when a match is live or has just been finished
    saveMatchButton.classList.toggle('hidden', isViewingSavedMatch);

    // Show summary if the match is in a read-only state and a summary exists
    if (isReadOnly && matchSummary) {
        summaryContainer.classList.remove('hidden');
        summaryContent.textContent = matchSummary;
    } else {
        summaryContainer.classList.add('hidden');
    }
}


// --- Camera Functions ---

async function startCamera(facingMode = 'environment') {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }
    try {
        const constraints = {
            video: { facingMode: facingMode },
            audio: true
        };
        cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
        cameraFeed.srcObject = cameraStream;
    } catch (err) {
        console.error("Error accessing camera:", err);
        addMessage("Could not access the camera. Please ensure permissions are granted.", 'system');
        closeCamera();
    }
}

function openCamera() {
    cameraModal.classList.remove('hidden');
    cameraPreview.classList.add('hidden');
    photoPreview.classList.add('hidden');
    videoPreview.classList.add('hidden');
    startCamera(currentFacingMode);
}

function closeCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    cameraModal.classList.add('hidden');
}

async function switchCamera() {
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    await startCamera(currentFacingMode);
}

function takePhoto() {
    const canvas = document.createElement('canvas');
    canvas.width = cameraFeed.videoWidth;
    canvas.height = cameraFeed.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(cameraFeed, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    tempCapturedMedia = { data: dataUrl, mimeType: 'image/jpeg' };
    showPreview();
}

function toggleVideoRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        // Stop recording
        mediaRecorder.stop();
        toggleRecordButton.classList.remove('recording');
    } else {
        // Start recording
        if (!cameraStream) return;
        recordedChunks = [];
        const options = { mimeType: 'video/webm; codecs=vp9' };
        mediaRecorder = new MediaRecorder(cameraStream, options);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = async () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const dataUrl = await blobToBase64(blob);
            tempCapturedMedia = { data: dataUrl, mimeType: 'video/webm' };
            showPreview();
        };

        mediaRecorder.start();
        toggleRecordButton.classList.add('recording');
    }
}

function showPreview() {
    if (!tempCapturedMedia) return;
    cameraPreview.classList.remove('hidden');
    if (tempCapturedMedia.mimeType.startsWith('image/')) {
        photoPreview.src = tempCapturedMedia.data;
        photoPreview.classList.remove('hidden');
        videoPreview.classList.add('hidden');
    } else {
        videoPreview.src = tempCapturedMedia.data;
        videoPreview.classList.remove('hidden');
        photoPreview.classList.add('hidden');
    }
}

function retakeMedia() {
    cameraPreview.classList.add('hidden');
    tempCapturedMedia = null;
}

function useCapturedMedia() {
    capturedMedia = tempCapturedMedia;
    if (capturedMedia) {
        mediaPreviewThumbnail.src = capturedMedia.data;
        mediaPreviewContainer.classList.remove('hidden');
    }
    closeCamera();
}


// --- Event Listeners & Initialization ---

// Handle the main prompt submission
promptForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const prompt = promptInput.value;
    if (prompt) {
        generateCommentaryAndHighlights(prompt, capturedMedia);
        promptInput.value = '';
        capturedMedia = null;
        mediaPreviewContainer.classList.add('hidden');
    }
});

// Handle the initial pre-match setup form
scoreForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Reset state for a new match
    isViewingSavedMatch = false;
    isMatchFinished = false;
    matchSummary = null;
    commentaryHistory = [];
    highlightsHistory = [];
    highlightIdCounter = 0;
    matchStats = { possession: { home: 50, away: 50 }, shotsOnTarget: { home: 0, away: 0 }, fouls: { home: 0, away: 0 } };
    trackedPlayer = null;
    trackingInfo.classList.add('hidden');
    commentaryFeed.innerHTML = '';
    highlightReel.innerHTML = '';
    highlightsPlaceholder.classList.remove('hidden');
    
    currentScore.home = parseInt(scoreInputs.homeScore.value, 10) || 0;
    currentScore.away = parseInt(scoreInputs.awayScore.value, 10) || 0;
    updateScoreboard();
    updateStatsUI();
    updateViewForMatchState();

    preMatchSetupView.classList.add('hidden');
    liveBroadcastView.classList.remove('hidden');

    addMessage('The broadcast has started! Describe the action on the pitch to get live commentary.', 'system');
    startTimer();
    generateAndUpdateLogo(scoreInputs.homeTeam.value, logoPreviews.home, broadcastUI.homeTeamLogo);
    generateAndUpdateLogo(scoreInputs.awayTeam.value, logoPreviews.away, broadcastUI.awayTeamLogo);
});

// Handle player tracking form
playerTrackForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const playerToTrack = playerTrackInput.value.trim();
    if (playerToTrack) {
        trackedPlayer = playerToTrack;
        trackedPlayerName.textContent = trackedPlayer;
        trackingInfo.classList.remove('hidden');
        addMessage(`Now tracking ${trackedPlayer}.`, 'system');
        playerTrackInput.value = '';
    }
});

clearTrackingButton.addEventListener('click', () => {
    addMessage(`Stopped tracking ${trackedPlayer}.`, 'system');
    trackedPlayer = null;
    trackingInfo.classList.add('hidden');
});

// Toggle visibility of the setup form
toggleScoreFormButton.addEventListener('click', () => {
    preMatchSetupView.classList.toggle('hidden');
});

// Autoplay toggle
autoplayToggle.checked = isAutoplayEnabled;
autoplayToggle.addEventListener('change', () => {
    isAutoplayEnabled = autoplayToggle.checked;
});

// Handle save/load/delete/finish actions
saveMatchButton.addEventListener('click', saveMatch);

finishMatchButton.addEventListener('click', async () => {
    if (confirm('Are you sure you want to end the match? You will no longer be able to add commentary.')) {
        isMatchFinished = true;
        updateViewForMatchState();
        await generateMatchSummary();
    }
});

startNewMatchButton.addEventListener('click', () => {
    liveBroadcastView.classList.add('hidden');
    preMatchSetupView.classList.remove('hidden');
    isViewingSavedMatch = false;
    isMatchFinished = false;
    matchSummary = null;
    stopTimer();
    updateTimerUI(0);
    updateViewForMatchState();
});

savedMatchesList.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const matchId = target.dataset.matchId;
    if (!matchId) return;

    if (target.classList.contains('load-match-button')) {
        loadMatch(Number(matchId));
    } else if (target.classList.contains('delete-match-button')) {
        if (confirm('Are you sure you want to delete this saved match?')) {
            deleteMatch(Number(matchId));
        }
    }
});

// Camera event listeners
cameraButton.addEventListener('click', openCamera);
closeCameraButton.addEventListener('click', closeCamera);
switchCameraButton.addEventListener('click', switchCamera);
capturePhotoButton.addEventListener('click', takePhoto);
toggleRecordButton.addEventListener('click', toggleVideoRecording);
retakeMediaButton.addEventListener('click', retakeMedia);
useMediaButton.addEventListener('click', useCapturedMedia);
removeMediaButton.addEventListener('click', () => {
    capturedMedia = null;
    mediaPreviewContainer.classList.add('hidden');
});

// Initial render of saved matches on page load
renderSavedMatchesList();
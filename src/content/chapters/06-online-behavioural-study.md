---
title: "Chapter 6: Online Behavioural Study"
slug: online-behavioural-study
author: Sulaiman Ahmed
date: 2025-09-15
categories: [study, behavioural]
image: /posts/welcome/thumbnail.jpg
note: "Large-scale online validation of memory and segmentation findings."
tag: study
order: 6
---
# 6.1 Introduction
The last part of our project is an online study to look into human recall structure. As we have seen in chapter 2, event segmentation is suggested as a basis for episodic memory recall. In chapter 3 we produced surprise (salient) events using a convolutional neural network that is 8 layers deep and in chapter 5, Sherman et al. (2022) proved that event boundaries are reflected into stable shifts in neural activity across the visual cortex hierarchies and tracking event boundaries as surprise or salient events can generate subjective reports of time. In this chapter we introduce an online study that investigates what actually people remember and whether event boundaries plays a role in recalling events from past experiences. To do so, we have clipped the short videos used earlier in CNN, fMRI, and perception consensus models based on dynamic event boundaries that overlaps the 3 methods (see methods, section 6.4 for details). Participants in the online study were shown a sequence of these short clips, and 3 days later we presented 1-2 seconds sub-clips either before event boundaries, or non-boundaries sub-clips that has no relevance or overlaps to any of the 3 methods (see section 6.4.2) and we asked them to describe what the next scene is going to be, using their own words. This design allowed us to investigate whether human episodic memory and recall is structured better around moments of surprise or predicted boundaries.

# 6.2 Video segmentation tool
The videos used in our online behavioural study are sourced from previous empirical studies (Roseboom et al., 2019; Mariola et al., 2022; Sherman et al., 2022). All of these studies share the same movie ID, type ID (city, office), trial ID, duration, and starting frame. We merged videos used in perception census with fMRI study based on the identifiers mentioned. The resulting list has videos that appeared in both studies. The main challenge we faced is access to those clips which were sampled from 33 videos, approximately 5 minutes (~9,000 frames). The original code function generated a pseudo-random list of 4290 trials out of the cumulative video duration (165 minutes). The output contained 330 repetitions of 13 durations, ranging from 1 to 64 seconds (1, 1.5, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64 seconds) (Mariola et al., 2022).

To rebuilt videos from their Id's we used a Fast Forward Moving Picture Experts Group (ffMPEG) library, a universal media converter that has a plethora of video editing tools such as segmentation, filtering, and clipping. This marks the first step in processing videos, which takes videos from long-format into short 8-24 seconds range of videos based on our list of Id's we merged across perception census and fMRI studies. In figure (6.1) below, we show two processes applied on videos. The first one we explained above is called general-segmentation step, which prepares videos for task one of the study, the second process, we call specific-segmentation which prepares sub-clips for task 2 of the study. In next section we explain the architecture of both processes in details.

## 6.2.1 Architecture

### 6.2.1.1 General segmentation
The first step of processing videos is called "general segmentation", a process by which a video is segmented into separate entities based on predefined criteria (i.e., time windows, and frame starting-point). These criterion are set from pseudo-randomised function that generated 4,290 trials. Henceforth, the goal of general segmentation is to re-create or reverse-engineer the process to produce the videos from a starting point and an end point.

The code function we developed takes two variables: a csv input with column called "video_id" and a source folder that contains the full video names (e.g., video_1.mp4, video_2.mp4,..etc.). To align "video_id" into "video_No" we created a method that map those two names accordingly without causing an issue. We then pass the two variables into another method to check whether the timestamps are valid and not out of the boundaries.

A docker image is then created from a Dockerfile, a script that specifies the configuration, dependencies, and runtime instructions. Once the image is created, a container is built and launched on top of it to execute the application in an isolated environment. Docker application will point to the same source files and process them one-by-one. When completed a notification of completion will be displayed and log file with all the invalid operations will be saved. Figure 6.2 explains the process end-to-end from resolving video paths and parsing boundaries to saving files in "trimmed_videos" folder. Note that the execution of code is dependant on valid boundaries to avoid throwing exceptions on the application level.

### 6.2.1.2 Specific segmentation
The second step of processing video-clips is more "specific" as it follows rules that we've explicitly set to achieve the goal we identified in the general introduction of chapter one: Can participants recall events or scenes more accurately and with richer descriptions at event boundaries?

To achieve this we're using the output of step 1 "general segmentation" as an input for this step. Naming conventions of both "video_id" sub-clips and file names are aligned from a previous step. They're parsed based on identifiers and boundaries/gaps cutting-points. Both boundaries and non-boundary gaps are checked for their preceding and following neighbours. If the distance between two events is less than two seconds it will be moved to a mechanism that captures one frame prior to the start of the event based on this equation:

$$frame = \max\left(start\_event - \frac{1}{fps}, 0\right)$$

If the distance is equal or bigger than 2 seconds it will start at (T-2 seconds) and last for one second only such that the new distance between this new prior and the event is 1.0 second only:

$$start\_subclip = start\_event - 2.0$$

$$end\_subclip = start\_subclip + 1.0$$

These equations applies to both event-boundaries and non-boundary gaps. Similar to "general segmentation" process, a docker image will spin-up and generate a docker container that will execute the code to trim videos with ffMPEG library. Instances are then saved and organised by type to "ev_clips" and "gaps_clips". Figure 6.3 shows the processing stages, and outputs. Note the launch of docker image and container to execute the ffMPEG instance in an isolated environment which makes it easy to share and deploy code across collaborators, servers, or cloud platforms.

## 6.2.2 Outputs
To conclude with video segmentation tool, we've listed below the outputs of both "general segmentation" and "specific segmentation". In sub-clips folder, we've selected 10 videos based on criterion defined in 6.4.3. Figure 6.4 shows directory structure of the videos selected for the first task of the study, where StartFrame refers to the beginning of the sub-clip within the 9,000 frames, StimDuration denotes the length of the sub-clip, FMRISubID identifies the participant who watched this video while under fMRI scanning, and RunID and TrialID indicate which running segment and trial number.

```
subclips/
    video_1_StartFrame_8311_StimDuration_20_FMRISubID_32_RunID_1_TrialID_12.mp4
    video_2_StartFrame_5725_StimDuration_20_FMRISubID_34_RunID_2_TrialID_13.mp4
    video_3_StartFrame_4954_StimDuration_12_FMRISubID_23_RunID_3_TrialID_14.mp4
    video_4_StartFrame_5682_StimDuration_8_FMRISubID_39_RunID_1_TrialID_15.mp4
    video_5_StartFrame_1733_StimDuration_20_FMRISubID_30_RunID_2_TrialID_1.mp4
    video_25_StartFrame_2047_StimDuration_8_FMRISubID_16_RunID_1_TrialID_13.mp4
    video_26_StartFrame_3057_StimDuration_24_FMRISubID_31_RunID_2_TrialID_9.mp4
    video_26_StartFrame_5426_StimDuration_20_FMRISubID_29_RunID_1_TrialID_17.mp4
    video_27_StartFrame_4867_StimDuration_16_FMRISubID_24_RunID_2_TrialID_16.mp4
    video_30_StartFrame_1488_StimDuration_24_FMRISubID_40_RunID_1_TrialID_1.mp4
```

General segmentation sub-clips are then used in specific segmentation to generate event-boundaries and non-boundaries gaps. Figure 6.5 shows video-03 directory structure, where overlap denotes the original event-boundary sub-clip, and overlap_0_prior1s refers to the 1-second preceding the event-boundary. Similarly the non-boundary gaps has overlaps and priors. Note the priorframe "videos" which are sampled just before the beginning of an event when the 2-second distance does not exist.

```
trimmed_clips/
    event_boundaries_overlap/
        video_03/
            video_03_event_boundary_overlap_0.mp4
            video_03_event_boundary_overlap_0_prior1s.mp4
            video_03_event_boundary_overlap_1.mp4
            video_03_event_boundary_overlap_1_priorframe.mp4
    no_ev_gap_periods/
        video_03/
            video_03_non_event_gap_0.mp4
            video_03_non_event_gap_0_prior1s.mp4
            video_03_non_event_gap_1_priorframe.mp4
```

# 6.3 Web portal

## 6.3.1 Workflow
In the first inning of this chapter, We have gone through preparing video sub-clips through video segmentation tool. In this inning we're moving to the technical aspect of building an online outlet to test our thesis; a web portal.

To make our behavioural test accessible and easy to use, we have taken the route of developing our own web portal. Our goal is to have an isolated environment with full control over the dynamics of the tasks and limit user interaction such that all attention is directed to the tasks by removing noise from the interface, and to enforce a method that stops the videos from playing when the user switch to other tabs or applications. To Achieve this goal, we are using React, a Javascript library for building interfaces. React offers interactive pages that update dynamically as the user interacts with them. It also uses a virtual Document Object Model (DOM), an in-memory representation of the real DOM, to apply only the changes needed to the User Interface (UI). We are hosting the website on Netlify, a service made for developers to push their projects on the web.

The website user-journey starts with a landing page that has information sheet describing what the project details, and move to a consent page a page-wall that limit the user from accessing the first task "watching videos". The consent form has a signature pad and an email address field to register the user's contact information to later access the second task. Once consent is given, users will be directed to the video-watching task. Upon completing the task, the system "a cookie-based variables" checks whether the user has submitted their responses. When submission is successful, the system run a local cookie registration that stores the user session data and creates a user record in the database for tracking purposes. This process triggers a "Zapier" automation, which manages the task of sending the second task to users based on their submission times. The system then enforces a 72-hour gap before sending the second task. If the users try to access any page on the website (such as trying to re-watch videos before the end of 72-hour delay), they will be redirected to countdown page with the time being updated in real-time. The only way to override this process is by removing the cookie or deleting browser history data from the settings. Once 72 hours have passed, a zap – a connected workflow that connects apps and services – will trigger an email automation that include a link to the second task. The second the user access this webpage, the system again checks for submission. If the questionnaire is not submitted, the participant stays at this stage until it is completed. A successful submission leads the user to a confirmation page, and triggers an update to the local cookie to reflect the participant's final status. Lastly, the user will be directed to a questionnaire confirmation page that locks the user on this page when the user tries to reload the website or re-do the questionnaire. Figure 6.6 shows the workflow of the website from landing page to the submission of questionnaire.

## 6.3.2 Architecture
The web portal is composed of 4 main components (figure 6.7), React is the main technology we are using for the interactive user interface (UI). it sends requests via Application programming interface (API) to a server and interacts with the database to submit and retrieve users' data. When the token verification is passed, a google app script governs incoming HTTP POST requests, when the function is triggered, it parses the body of the request, expecting JavaScript Object Notation (JSON) data. When the user submit the first task, the code append new raw in a spreadsheet with the user email address, and submitting time. The script generates a local time when at the arrival of data, and generates another field "delayedAt" that adds 72 hours to the "submittedAt" field. This method ensures both "submittedAt" and "delayedAt" always have valid values. Similarly, when the user submits the second task, the code constructs an array, consisting of "user ID", "email", and pairs of "question IDs" with their corresponding answers for all the questions, followed by a "submittedAt" timestamp field. This new array append a new row in the spreadsheet.

## 6.3.3 Data flow and structure
The website data move in two directions. Mainly, the data is saved in a local cookie to record the user's status. Table 6.1 below shows the parameters we use in the cookie at the video task page. When the video session starts a "videoSessionStarted" variable is set to "true", we also shuffle videos using "videoOrder" parameter, each time a new session starts to ensure that different participants are not seeing the same order of the videos. Since we are using a delayed follow-up task, recording date and time is critical to ensure an accurate automation service. "Consent_time" records when the user submit the consent, and "videosCompleted" is set to true when the user watches all videos. When the user submit the questionnaire task, a "questionnaire-submitted" parameter is set to "true" to prevent the user from re-doing the task again. This same parameter will be used to lock the website on questionnaire-confirmed page.

| Cookie | When Set | Value |
|---|---|---|
| videoSessionStarted | Session start | "true" |
| videoOrder | Session start or reload | JSON string of shuffled video URLs |
| consent_time | On completion | Timestamp |
| videosCompleted | On completion | "true" |
| questionnaire-submitted | On submission | "true" |

*Table 6.1: Cookies set and used by the VideoTask.js and questionnaire.js component to manage participant progress.*

Table 6.2 shows another group of parameters stored in local storage, and used at the questionnaire component level. "questionnaire-start-time" records the starting time of the questionnaire, it is used to filter submissions at the database level by comparing it to the first task timing. If more than 24 hours have been passed between the time of sending the follow-up email and starting the questionnaire, the participant will be excluded from analysis. usersCount on the other hand, is used internally by the system to determine what to show to the user (see section 6.4.5 for more details).

| LocalStorage | When Set | Value Stored |
|---|---|---|
| questionnaire-start-time | When the questionnaire page loads and no existing start time is found | Unix timestamp in milliseconds at the time of setting |
| usersCount | When fetching or incrementing the user count from the backend | Integer count of users (converted to string) |

*Table 6.2: Local storage parameters stored at the questionnaire.js component level.*

The project structure is reflected in figure 6.8 which follows the standard React project. Build folder contains the production build for the project and it's generated via npm run build command, and contains static files that can be deployed to any server easily. node_modules folder is created automatically when running npm install and it contains all the javaScript packages and their dependencies. Static assets such as favicon, manifest, logos, and other static media are stored in public folder, and source folder contains all the main components, styles, and logic. Alongside these folders, environment variables such API URLs and APIs are stored in .env folder. Lastly, .gitignore file specifies which files to skip by Git, and package.json and package-lock.json files lists the dependencies for starting, building, and deploying the app to ensure consistent installation across environments.

```
project-root/
    build/
    node_modules/
    public/
    src/
        App.css
        App.js
        App.test.js
        Confirmation.js
        ConsentForm.js
        index.css
        index.js
        InfoSheet.js
        questionnaire-confirmed.js
        Questionnaire.js
        reportWebVitals.js
        VideoTask.js
    .env
    .gitignore
    package-lock.json
    package.json
    README.md
```

# 6.4 Methods
A series of methods are used to identify salient events in video sub-clips, and boundary peak detection across perception census participants. We'll also use dynamic event boundary method to identify boundaries consistently across fMRI and perception census studies. We'll then find boundaries of agreement across the three core studies and lastly explain the sub-clips extraction process.

## 6.4.1 Boundary peak detection
Identifying peaks in boundary agreement among participants is central to event segmentation and memory studies. Zacks et al. (2001) study was the first of its kind to use boundary detection behaviourally and link it to neural activity. In this study, participants watched movies and pressed a button to they feel "one meaningful unit of activity ends and another begins." (J. Zacks & Trversky, 2001). When aggregation method was applied to the key-press timestamps across participants, then binning them over time, peaks of agreement emerged which ultimately is translated as event boundaries. Similarly, in our consensus perception dataset (see chapter 4), each video is segmented by many participants and aggregating their answers by video is necessary to identify an agreement of shared boundaries that represent collective perceptual consensus. The perception consensus dataset structure post-processing and analysis is as follows:
- Video name
- Video type
- Video duration
- User Id
- Timestamps

Video names and types are grouped together then passed to calculate bin time:

$$bins = \{t_0, t_1, \ldots, t_n\}, \quad t_i = i \cdot \Delta t, \quad \text{for } i = 0, 1, \ldots, \frac{T}{\Delta t}$$

Where:
- T is the duration of the video
- Δt is the bin size (0.25 seconds)

Participants data are then aggregated and transferred into a histogram by counting the number of users who marked an event in that bin:

$$C_i = \sum_{u=1}^{U} \mathbf{1}_{[t_i, t_{i+1})}(\tau_u)$$

Where:
- U is the number of unique users u1, u2, .., uU
- τu = {tu1, tu2, , tuk}, where τu is a list of timestamps for user u

To get proportion of participants (see histogram of figure 6.11) who marked an event per bin we apply:

$$D_i = \frac{C_i}{U} = \frac{\text{Number of keypresses in bin } i}{\text{Total number of participants}}$$

For instance, if 6 people watched a video and 2 of them pressed a button between 1.0 and 1.25 seconds, then: Di = 2/6 = 0.3, which means 30% of participants marked a boundary at that moment. This value will later become part of the boundary density curve.

Before converting this histogram data into peaks, we apply Gaussian smoothing to reduce noise and make peaks clear to distinguish (peaks = events):

$$G[k] = \frac{1}{\sqrt{2\pi}\sigma} e^{-\frac{k^2}{2\sigma^2}}, \quad \text{for } k = -K, 0, K$$

Where:
- G(k) is the value of Gaussian function at point k
- σ is the standard deviation, and is set to 0.25
- σ² is the variance

We now apply convolution on the Gaussian smoothing:

$$\tilde{d}_i = \sum_{k=-K}^{K} G(k) \cdot d_{i+k}$$

Where:
- d = [d0, d1, d2, ..., dn] is the original signal, and each di is the proportion of participants who pressed a button during time bin i
- K: how many bins we consider on either side (i.e., half width of the Gaussian kernel)

Thus, to calculate smoothed value at bin i, we will take weighted sum of the values from its neighbours: d̃i = G(−K) · di−K + G(−K+1) · di−K+1 + ... + G(0) · di + ... + G(K) · di+K

Where:
- di represent the original value.
- di−1, di−2, ..., di−K represent its left neighbours.
- di+1, di+2, ..., di+K represent its right neighbours.

Figure 6.9 below shows an example from our videos library where 6 participants annotated the same video, n represents the number of button clicks, t represents the time at which the button was clicked. The visual simplifies early grouping and processing and puts more emphasis on the visualising histogram shape and detected peaks at final.

## 6.4.2 Dynamic event boundaries
Event boundaries are fuzzy (Zacks & Swallow, 2007). It's unknown at what exact time or transition they form. Several research techniques have suggested methods such as Hidden Markov Model (HMM), which models brain activity as a sequence of hidden (unobserved) states (Geerligs et al., 2021) and each state is characterized by a specific mean activity pattern across voxels. Imposing sequential order of states, limits the flexibility of the model (Geerligs et al., 2021). Greedy State Boundary Search (GSBS) on the other hand searches for transitions between states but is not designed to identify recurring states. GSBS performs a simple greedy search algorithm that identifies state boundaries through an iterative process (Geerligs et al., 2021). While this method is plausible, and it outperforms HMM in both accuracy and computational modelling, our concern is it applies only on Voxel-wise fMRI data where each time point is represented by 2-Dimensional activation pattern (voxels × time-points) and not on 1-Dimensional data like ours. Other researchers have suggested symmetrical boundaries around salient moments, encapsulating it with equal temporal distance in both directions. We believe this approach is not plausible, as an overlap of boundaries might occur. Additionally, this assumes an equal experience across different types of scenes which is not realistic, given that people have different perceptual experiences in different environments (Roseboom et al., 2019; Sherman et al., 2022).

Figure 6.10 shows an example of one videos across the 3 modalities: Salient Perceptual Changes based on computational model described in chapter 3, surprise events identified through peak boundary based on perception consensus study of chapter 4, and BOLD salient events based on fMRI-model of chapter 5. All three datasets share similar structure and parameters and thus it is important for us to create a method that is consistent, and performs equally when applied on any dataset. To do so, we developed a dynamic event boundary function that calculates the distance between two salient changes and divides it by 4. This method not only create dynamic boundaries but also place the salient change flexibly in time, based on both preceding and subsequent events.

$$Distance_{left} = TS_n - \frac{(TS_n - TS_{n-1})}{4}$$

$$Distance_{right} = TS_n + \frac{(TS_{n+1} - TS_n)}{4}$$

Where:
- TSn is the timestamp of current salient event.
- TSn+1 is the timestamp of next salient event.
- TSn−1 is the timestamp of previous salient event.

Figure 6.11 shows an example of video frame with 3 salient events. Left boundary is calculated by subtracting the current time of salient event from the previous one then dividing it by 4. Similarly the right boundary is calculated by subtracting the next salient event timestamp from the current one.

## 6.4.3 Boundaries selection across modalities
Up until this point, we have performed boundary peak detection on perception consensus dataset in section 6.4.1, and applied dynamic event boundaries on fMRI and perception consensus datasets in section 6.4.2. This section concerns the selection of boundaries at agreement across the 3 datasets, the goal is to identify and label model-predicted surprise events and boundaries that:
- Align with fMRI and perception boundaries (at least within 0.5 seconds).
- Those occur outside of such boundaries are labelled as non-overlap
- Label those that are well-structured as super-records as candidates to use in the online behavioural study

Key processing steps to achieve this goal:

1. **Extract metadata of video records**
   - Each row (video) has metadata embedded in filenames (e.g., start frame, duration, run/trial IDs).

2. **Find matches across fMRI, Perception consensus, and CNN-model**
   - Align rows across datasets using (StartFrame, RunID, TrialID)
   - Extract triplets of events from fMRI and perception consensus [(Bc_left, Sc, Bc_right), (Bc+1_left, Sc+1, Bc+1_right), ..] and single timestamps from CNN-model

3. **Determine overlapping event boundaries**
   - Compare triplets of boundaries from fMRI and perception data.
   - Iterate in 3-step window: fMRI(Bc_left, Sc, Bc_right) and Perception(Bc_left, Sc, Bc_right)
   - We mark it as "overlap" if:
     - One boundary triplet contains the other (at least within 0.5 seconds), and
     - At least one surprise event falls inside the shared region.

4. **Classify non-overlapping events**
   - Any model event not involved in an overlap is treated as a non-overlap event.

5. **Detect non-event gaps**
   - Identify gaps between boundaries from both fMRI and perception by sorting all boundaries, loop over consecutive pairs and then mark it as a gap if it's longer than 0.8 seconds long, and Not too close (<1 second) to an overlapping segment. This ensures we detect stable non-event periods.

6. **Tagging "super-record"**
   - A trial is marked as "super record" if:
     - Overlapping segments ≥ 1 when video duration is 8 seconds, and ≥ 2 when video duration is > 8 seconds.
     - Contains at least one no-event gap ≥ 2 away from any overlap.

Figure 6.12 shows an overlap "shaded area" where perception consensus boundaries are contained within fMRI boundaries, and at least one surprise event produced by the CNN-model falls within this shared interval. In general, two mathematical representations rule this process:

One boundary contains the other (within a margin):

$$C = (l_p - \delta \leq l_f \text{ and } r_f \leq r_p + \delta) \lor (l_f - \delta \leq l_p \text{ and } r_p \leq r_f + \delta)$$

Surprise events (CNN-model) falls within the shared region: R = [min(lf, lp) − δ, max(rf, rp) + δ], then, the condition will be:

$$\exists s \in \text{model events} \quad \text{such that } s \in [\min(l_f, l_p) - \delta, \max(r_f, r_p) + \delta]$$

Where:
- C is a container defined as one interval wrapping the other (within 0.5 seconds).
- R is a suggested region defined by container limits.
- s ∈ R is a surprise event time predicted by CNN-model.
- [lf, rf] are the boundary pair from fMRI (left,right). Note we're minimizing the triplet by eliminating Sc original salient event.
- Similarly, [lp, rp] is the boundary pair from Perception data.
- δ = 0.5 is the temporal margin.

## 6.4.4 Sub-clips extraction process
In the previous section, a series of event-boundary containers and gaps (no activity happens for minimum of 2 seconds and not less than 1 second distance from an event boundary). Out of 2,330 video, we have identified 5 super-records of type city and another 5 of type office. Each video contained two key sub-clips:
- An event-boundary adjacent sub-clip (2 seconds prior to the start of event-boundary)
- A gap (non-boundary sub-clip), taken from a perceptual and model "silence"

These short (1-2 seconds long) sub-clips were presented to participants in the questionnaire page disseminated 3 days after watching the original video clips to test their ability to predict the upcoming events. Table 6.3 below list the type of videos, their durations, event-boundary adjacents, and non-event gaps.

| video | type | duration | event-boundary adjacents | non-event gaps |
|---|---|---|---|---|
| 1 | City | 20 | [(2.0625, 3.3125), (4.4375, 5.4375), (6.0, 7.0), (8.4375, 9.75)] | [(0.5, 1.75), (10.0, 10.8), (11.88, 13.0), (14.2, 15.4), (16.4, 17.2)] |
| 2 | City | 20 | [(2.4, 3.8)] | [(5.5, 6.8), (9.2, 10.0), (14.25, 15.2), (17.0, 17.81)] |
| 3 | City | 12 | [(1.625, 2.75), (4.25, 6.125), (8.375, 9.6875), (10.0625, 12.6875)] | [(7.31, 8.2), (9.75, 10.6)] |
| 4 | City | 8 | [(4.4, 5.6)] | [(6.2, 7.4)] |
| 5 | City | 20 | [(9.1875, 14.0)] | [(1.4, 2.6), (3.8, 5.0), (5.6, 6.4), (6.4, 8.0), (11.0, 12.2), (15.0, 16.2), (17.6, 19.25)] |
| 25 | Office | 8 | [(4.25, 6.25), (7.75, 8.625), (9.2, 10.0), (9.75, 11.875)] | [(1.4, 2.6)] |
| 26 | Office | 20 | [(18.9375, 20.625)] | [(1.4, 2.6), (3.6, 4.4), (5.4, 6.6), (7.8, 9.0), (22.4, 23.2)] |
| 26 | Office | 24 | [(1.5, 2.625), (2.8, 4.4), (11.5, 14.25)] | [(2.5, 3.4), (11.94, 12.8)] |
| 27 | Office | 16 | [(7.4, 9.2)] | [(3.0, 4.2), (7.8, 9.0), (10.0, 10.8), (11.6, 12.4), (13.62, 14.88), (16.75, 17.8)] |
| 30 | Office | 24 | [(19.25, 21.0)] | [(11.8, 12.69), (14.0, 14.8), (15.8, 17.0), (18.0, 18.8)] |

*Table 6.3: List of videos used in the online behavioural study, with their event-boundary adjacent timestamps and non-event gap timestamps.*

## 6.4.5 Counter-balanced questions
The previous section prepared the sub-clips from our selected videos, which will pass through a counter-balanced mechanism that separates boundary-adjacent sub-clips from non-boundary ones.

This method controls what will be shown to the user. When the user starts the questionnaire, the web app will send a request of type "fetch" from the back-end. If the "userCount" parameter (see localstorage table in section 6.3.3) is an even number (0, 2, etc.), the function will return boundary-adjacent sub-clips are shown in odd-numbered questions (1st, 3rd, etc.), and non-boundary sub-clips are shown in even-numbered questions (2nd, 4th, etc.). In contrast, if the "userCount" is odd number (1, 3, etc.) the ordering is reversed. Non-boundary sub-clips appears in odd-numbered questions (1st, 3rd, etc.), and boundary-adjacent sub-clips are shown in even-numbered questions (2nd, 4th, etc.). When the user submit task 2, a "post" request is sent to the server, which increments the count of users in the database. Ultimately, this pattern will ensure half participants will see a use-case different from the other half, which leads to reducing bias and distribute conditions equally across participants.

## 6.4.6 Ethics statement
The study was approved by the University of Sussex Ethics Committee (Reference number ER/SA2329/1). All participants gave informed, written consent online.

## 6.4.7 Participants
Adult volunteers from both the university student body and members of the public (all participants are above 18) were invited to participate in the online study. An invitation email to students of the current cohort of MSc AI and Adaptive Systems, School of Engineering was sent with description about the tasks and how their data will be used. Prior to starting the experiment all participants viewed an information sheet, proceeded by consent page. Once a signature, and an email address is provided the first task will start.

24 participants completed both tasks, and their email addresses were replaced by IDs. Each participant completed 10 questions and their submission times were recorded. 2 participants exceeded 24-hour period they were given to answer the questions from the time their second task was activated, and they were excluded from the analysis of the results.

## 6.4.8 Stimuli
All online participants were shown a list of 10 silent videos that ranges from 8 seconds long to 24 seconds long. The first 5 video clips were based in the city of Brighton (UK), and the second 5 video clips were in an office setting at the university of Sussex. A GoPro Hero 4 camera was used to record the indoor and outdoor videos at 60 Hz and 1920x1080 pixels. Video frames were then processed at 30 Hz and 1280x720 pixels, and no changes or modifications were applied to the brightness of the videos (Roseboom et al., 2019; Mariola et al., 2022).

Videos were selected based on the criteria we defined in section 6.4, when there is an overlap of event boundaries across CNN, fMRI, and perception consensus models, the video will be highlighted. Another criteria used is to look for areas where there is 1-2 seconds prior to an event boundary and 1-2 seconds of duration that does not have an event boundary at all (see figure 6.13). City videos had greater perceptual change than those in the office, and the computational basis for the perceptual change was previously computed by Roseboom et al. (2019) as explained in chapter 3.

## 6.4.9 Design and procedure
Silent videos started playing in the same order for all participants, starting with city scenes (5 videos), then office scenes (5 videos). Duration/progress bars were hidden from the videos alongside the play/pause and full-screen mode buttons. An explicit play/pause button was placed outside the video frame in case participants are interrupted or wish to take a break at any point in time during the task. Videos were separated by 5 seconds delay, and a window listener is activated (see section 6.3) on the browser such that when the user switch to another browser tab or application the video will be paused immediately. This soft interruption mechanism ensures participants won't miss details from videos by switching to other activities on their devices. (see figure 6.14).

3 days (72 hours) after completing task 1, an automated email is sent to participants that contains link to Task 2 of the study. Task 2 was open for 24-hours window and participants who submitted outside this time-frame were excluded from the analysis to ensure consistency in recall effect. Sub-clips were extracted from task 1 videos based on a set of predefined criteria related to event boundaries, as explained in section 6.3.4 data preparation for online study. The following question and guidance were provided under each sub-clip (see figure 6.15):

> This is a sub-clip from one of the videos you watched 3 days ago. What do you think happens next in this scene?

> There's no right or wrong answer, just share your best guess based on what you remember. You might consider:
> - What the people, objects, or camera might do next.
> - Whether the scene is about to shift, continue, or pause.
> - Any clues from the moment that hint at what's coming.
> - Description of stores, cafes, restaurants, street signs.

A minimum of 8 words required to proceed to the next video, and a re-submission is not allowed. Email addresses were collected at the beginning of the task to match them with their registration information. As explained in section 6.4.5, Watching a boundary-adjacent or non-boundary sub-clip depends on the user count stored in a local system variable to determine what to show, ensuring balanced options across the study.

## 6.4.10 Llava-Llama generated responses
To compare human and machine recall patterns, we used Large Multimodal model (LMM) to generate free recall descriptions after viewing the same video clips shown to participants. To achieve this we cloned an LMM that has Large Language and Vision Assistant and Large Language Model Meta AI (Llava-Llama), with 8 billion parameters, and Contrastive Language-Image Pre-training (CLIP) based vision encoder (Radford et al., 2021; Liu et al., 2024). Figure 6.16 shows the process of generating predictions. Frames are sampled from the videos at a rate that depends on the length of the video. We divide the length of a video (30 FPS) by 5, for example, if we have 50 frames we'll end-up with 50/5 = 10 which means we're taking every 10th frame. The reason we're using this method is the model can not handle many-frames at once, taking samples ensures the model have enough information about the context of the scene without overwhelming it. To avoid throwing exception, If the sub-clip contains fewer than five frames, the step size is set to at least one. Images are then encoded to Base64, as the model expects images to be passed in text format. We apply a consistent prompt across all videos that is similar to the one used in the online behavioural study:

> Describe the scene shown across these video frames in detail. What are the key actions taking place? What objects or people are present, and how are they interacting? What can you infer about the setting or context? Additionally, describe any camera movement. Does the camera pan, zoom, or stay still, and what might that suggest about what the viewer is meant to notice?

The model response is then saved into a text file and referenced when performing the second task, representing humans memory and adding richer context when performing the second task. The prompt for second task is as follows:

> The earlier summary of the video is: {scene_summary_here} What do you think happens next in this scene?

Lastly, the response of second task will be saved to subclip_text_summary.txt. Both Machine and human responses are organised by video and boundary type, and are passed for NLP analysis.

## 6.4.11 NLP analysis
To analyse participants' responses, we have applied a set of processing steps to make use of the data. The process starts with lowercasing the text, and apply tokenisation. This will separate text into separate tokens. Then stop words and numbers were removed from the tokens, keeping only informative tokens. Tokens are then passed to part-of-speech (POS) tagging which annotate each token with its type. Lastly, tokens are lemmatised, reducing words to their base forms. Figure 6.17 shows an example of text preprocessing applied to raw input from a participant. In the below subsections we'll go through the analysis metrics.

### 6.4.11.1 Cosine similarity
Once text is preprocessed, answers are re-grouped again by video and boundary type (i.e., city_event_boundary_overlap, city_non_event_gap, office_event_boundary_overlap, and office_non_event_gap). Term Frequency (TF) is calculated on each term to normalise raw counts such that longer documents will not dominate.

$$TF(t, d) = \frac{f_{t,d}}{\sum_t f_{t,d}}$$

where:
- ft,d: number of times term t occurs in document d
- Denominator: total number of term occurrences in d

We then compute Inverse Document Frequency (IDF) which is used to penalise common words. For example, if a word like "street" appears for few times, then IDF becomes large.

$$IDF(t, D) = \log\left(\frac{N}{1 + |\{d \in D : t \in d\}|}\right) + 1$$

where:
- |{d ∈ D : t ∈ d}|: number of documents containing term t

Combining Term Frequency and Inverse Document Frequency give us the most frequent and rare terms across documents. TF-IDF weight combines both measures using this equation:

$$w_{t,d} = TF(t, d) \cdot IDF(t, D)$$

where:
- m: number of documents.
- V: vocabulary size after preprocessing

To prepare cosine similarity, we calculate vector normalisation:

$$\hat{x}_i = \frac{x_i}{\|x_i\|_2} = \frac{x_i}{\sqrt{\sum_{k=1}^{V} x_{i,k}^2}}$$

where:
- xi is the feature vector for document i.
- V is the vocabulary size.
- xi,k is the k-th element of the vector for document i.
- ‖xi‖₂ is the L2 norm of that vector.

Lastly, we measure the angle between two vectors using cosine similarity equation:

$$\cos\_sim(x_i, x_j) = \frac{x_i \cdot x_j}{\|x_i\|_2 \|x_j\|_2}$$

where:
- xi · xj = Σk=1 to V xk·jk is the dot product.

### 6.4.11.2 Hapax richness
While cosine similarity give us an insight about the similarity across documents, hapax richness provide a measure to find rare words that appear only once in each corpus.

$$hapax\_richness = \frac{\text{\# words}}{\text{\# total tokens}}$$

where:
- \# words: number of unique words with frequency = 1.
- \# total tokens: total number of words in the text.

This equation is reflected in the code snippet below:

```python
# Listing 6.1: Hapax richness equation in Python
def hapax_richness(tokens):
    freq = Counter(tokens)
    hapaxes = [word for word, count in freq.items() if count == 1]
    return len(hapaxes) / len(tokens) if tokens else 0
```

### 6.4.11.3 Lexical diversity
Lexical diversity measure how varied is the vocabulary in corpus. In our text, we use it to measure how varied human responses are, and whether event boundaries influence the richness of vocabulary.

$$\text{Lexical Diversity} = \frac{U}{T}$$

where:
- U = |{w1, w2, ..., wT}|
- T = total count of words

### 6.4.11.4 Type Token Ratio (TTR)
We take each (video_type, boundary_type) pair and apply above lexical diversity equation, to provide unique values for each condition and compare them side-by-side in bar charts.

```python
# Listing 6.2: TTR calculation in Python
def calculate_ttr(tokens):
    return len(set(tokens)) / len(tokens) if tokens else 0
```

```python
# Listing 6.3: TTR plot in Python
def plot_ttr_by_condition(df, output_name):
    group_keys = [
        ("city", "event_boundary_overlap"),
        ("city", "non_event_gap"),
        ("office", "event_boundary_overlap"),
        ("office", "non_event_gap")
    ]
    results = []
    for video_type, boundary_type in group_keys:
        subset = df[(df["video_type"] == video_type) & (df["boundary_type"] == boundary_type)]
        all_tokens = [token for tokens in subset["tokens"] for token in tokens]
        ttr = calculate_ttr(all_tokens)  # <- TTR calculation here
        results.append((f"{video_type}_{boundary_type}", ttr))

    labels, values = zip(*results)
    plt.figure(figsize=(10, 5))
    plt.bar(labels, values, color="steelblue")
    plt.xticks(rotation=15)
    plt.ylabel("Type-Token Ratio (TTR)")
    plt.title(f"TTR by Condition - {output_name}")
    plt.tight_layout()
    plt.savefig(f"{comparison_dir}/ttr_by_condition_{output_name}.svg", format="svg")
    plt.close()
```

# 6.5 Results
We present in this section the results of running our online behavioural study, based on the methods explained earlier (see section 6.4), and NLP analysis methods explained in previous section.

Before delving into the analysis however, we must remind the reader of what we are trying to achieve running this study:
1. Do people better recall events that are around salient perceptual changes? can they make accurate predictions when the sub-clip is 1-2 seconds before an event boundary?
2. Through earlier chapter, we learned the environment play an instrumental role in event segmentation (e.g., City vs. Office). How this change influence participants' recall. Is it more memorable? what are the key differences between describing an event in the city compared to one in an office?

## 6.5.1 Cosine similarity
We begin our results by analysing cosine similarities across 4 modalities: city event boundary sub-clips, City non-event boundary sub-clips, office event boundary sub-clips, and office non-event boundary sub-clips. Each modality consists 55 textual submissions. answers were tokenised, lemmatised, and vectorised using TF-IDF method before calculating cosine similarity across the groups. Results showed that inter-context similarity is higher than across-contexts. Figure 6.18 shows strong similarity between city sub-clips prior to event-boundaries and those in the gaps (0.84), and a low similarity value of 0.27 between city and office sub-clips – despite being sub-clips prior to event boundaries. Office sub-clips show a strong similarity that matches the one we have had in city sub-clips prior to event boundaries. City and office gap sub-clips on the other hand recorded slightly higher similarity (0.34) than that recored between city and office prior to event-boundaries, which means more generic responses were provided in the absence of event segmentation. The lack of meaningful change in a scene could lead to weaker encoding of cues and therefore limiting ability to recall from memory.

Similar method is used to calculate cosine similarity index for LLM generated text. Figure 6.19 shows slightly different cosine similarities than those calculated on human text. A similarity index of 0.6 between event-boundary and non-event boundary sub-clips of city environment while office environment score higher (0.71). The model also score low across-context, 0.28 for city event-boundary sub-clips and office event-boundary sub-clips, and 0.25 cosine similarity between city non-event and office non-event sub-clips. Machine generated text shows limited sensitivity to event structure than human generated text, one reason for this might be the lack of context or background about specific scenes and using synthesising generic descriptions regardless of the changes happening in the frames input. Another reason could be the limits of computational power and number of parameters.

LLM text outputs are then used to compare against human responses. Here machine generated text is considered as the ground-truth for the videos used. Figure 6.20 shows human vs. machine generated text for city boundary types and figure 6.21 shows human vs. machine text for office boundary types. They both indicate a large divergence in words (i.e., vocabulary) for the same boundary type in office setting. The patterns used by humans are not replicated by the machine text around event-boundaries (Human event-boundary vs. machine event-boundary is 0.20) and slightly lower in non-event gaps (Human non-event gap vs. machine non-event gap is 0.19).

In city environment videos we noticed that participants re-used vocabulary in event-boundary and non-event gaps (i.e., traffic, street, people, cars), leading to a strong similarity of 0.8 between city event-boundary and city non-event gaps (see figure 6.18). A stronger similarity is recorded between human event-boundary and machine event-boundary responses (0.32) which is higher than that in office settings (0.20), and 0.26 similarity between human non-event gaps and machine non-event gaps (higher than office value). This may be due to training data of LLM used given that clearer visual cues and recognised objects appear in city scenes compared to that in office which is more ambiguous scenes. Llava-Llama model is trained on image-text pairs like COCO and city scenes are usually available in more quantities in those training datasets. Being exposed to rich language descriptions make it more aligned with how humans describe city scenes.

## 6.5.2 Hapax richness
Upon checking responses across participants, one characteristic emerged: Rare vocabulary (i.e., dissimilar). To measure this we applied hapax richness equation (see equation 6.17). Figure 6.22 shows Hapax richness for human participants. It's interesting to see higher richness (i.e., more rare vocabulary) in city scenes of non-event gaps compared to event-boundaries of the same environment. In contrast, office setting shows closer richness between event boundary and non-event gap sub-clips.

Participants watching event-boundary sub-clips re-use similar words to describe a familiar –recalled– scene, thus lower Hapax richness, and less descriptive but unique vocabulary for non-event gaps resulting in higher Hapax richness. This insight sparked new direction in our analysis: Hapax metric does not tell the full picture as it's sensitive to text length, and could be misleading if used alone. To address this point, we decided to calculate lexical diversity and TTR.

## 6.5.3 Type-Token Ratio
Applying equation 6.18 gives us diversity of vocabulary in our corpus. Figure 6.23 shows that more diverse words are used in responses of city non-event gaps, and close values (0.39 vs. 0.38) in office settings. This proves our earlier hypothesis of repetitive words used in describing –predicting the next scene – before event-boundaries, and unique words when describing a scene where there were no surprise (salient) events – event-boundaries.

TTR however is still sensitive to text length, to solve this we are introducing in the next section Mean Segmental Type-Token Ratio (MSTTR)

## 6.5.4 Mean Segmental Type-Token Ratio
To reduce the effect of length-text, we divide text into equal segments (i.e., 50 words each), and then we calculate TTR for each segment, and lastly we take the mean for all of the segment TTR's. Figure 6.24 visualises MSTTR by environment and boundary type. Interestingly, MSTTR values show similar trend to that of TTR, cementing the idea that non-event gaps have more diversity – in city scenes – than event-boundaries, and almost equal values of diversity in office environment.

## 6.5.5 Frequency distributions
To further investigate vocabulary and lexical distribution, we are calculating frequency distribution of top words for all scene and boundary types but the aim is to check the root cause of the previous findings in sections 6.5.4 and 6.5.2 and see what is dominating event-boundary response of city environment.

Table 6.4 shows the number of tokens per video_boundary_type, unique words, hapaxes, singleton_types, singleton_types_ratio, and singleton_tokens_ratio. We immediately notice the number of tokens are higher in event-boundary sub-clip responses regardless of scene type which is an indication of longer descriptions when predicting scenes at event-boundaries. But the number of tokens does not provide much of a value if there are duplicates across the corpus. To solve this we computed the unique tokens (table 6.4). Higher unique tokens are found in event-boundary sub-clip responses than that of non-event gap responses for both city and office settings. We then calculated the number of words appearing once in each video and boundary type (i.e., freq(word) = 1). 125 words appeared only once in the corpus of city event-boundary sub-clip responses which is equivalent to 57% of unique tokens. Compared to 128 or 60% in city non-event gap sub-clip responses. It is unclear the share of repetitive words that contribute to the corpus as a whole, in table 6.5 we calculate the top 10 share and gini coefficient for each video and boundary type. 29% of city event-boundary corpus is dominated by the top 10 most frequent words, slightly higher than non-event gap responses which is limited to 28% only. In contrast, office videos showed an increase of top 10 shares in non-event gaps and a considerably lower per cent (26%) in event-boundary responses. Lastly, we calculated lexical inequalities in each corpus, also known as Gini Coefficient, a statistical method to measure inequality of distributions. The closer the value to 1, the more unequal the distribution is, and if close to 0 it means an equal distribution of words. City event-boundary corpus recorded a Gini-Coefficient of 49% which indicates that almost half of words are unequally distributed across the corpus. Slightly lower (46%) unequal distribution in non-event gap corpus which translates to more balanced word distribution. Office boundary types on the other hand shows less influence on the distribution coefficient.

| Video type | Tokens | Unique Tokens | f(w) = 1 | f(w)=1 / unique tokens | f(w)=1 / total tokens |
|---|---|---|---|---|---|
| city_EV | 585 | 219 | 125 | 0.57 | 0.21 |
| city_non_EV | 500 | 210 | 128 | 0.60 | 0.25 |
| office_EV | 595 | 234 | 138 | 0.58 | 0.23 |
| office_non_EV | 550 | 211 | 121 | 0.57 | 0.22 |

*Table 6.4: Summary statistics of lexical concentration for each video and boundary type in human text responses. Where EV stands for event-boundary and non-EV stands for non-event gap.*

| Video type | Top 10 Share | Gini Coefficient |
|---|---|---|
| city_EV | 0.29 | 0.49 |
| city_non_Ev | 0.28 | 0.46 |
| office_EV | 0.26 | 0.47 |
| office_non_EV | 0.28 | 0.46 |

*Table 6.5: Proportion of the 10 most frequent words and lexical inequality for each video and boundary type in human text responses.*

## 6.5.6 Vocabulary distributions
In this last section of our analysis, we use another statistical metric to measure the distribution of vocabulary across our corpus. City event-boundary responses scored the lowest (79%) and office event-boundary responses scored the highest (91%) indicating that participants used the same vocabulary in city event-boundary sub-clips and more diverse and unique vocabulary in office event-boundary sub-clips (see table 6.6 below)

| Video type | Vocabulary distribution |
|---|---|
| city_EV | 79% |
| city_non_Ev | 85% |
| office_EV | 91% |
| office_non_EV | 81% |

*Table 6.6: Vocabulary distribution by video and boundary type. Where EV stands for event-boundary and non-EV stands for non-event gap.*

To see which video and boundary type are diverse and evenly spread, we visualised Vocabulary distribution against Gini coefficient (figure 6.25). 4 quadrants emerged:
1. High diversity, Even spread
2. High diversity, Uneven spread
3. Low diversity, Even spread
4. Low diversity, Uneven spread

Office event-boundary sub-clips is placed in the first quarter where high diversity of vocabulary is used and words are evenly spread in corpora. Surprisingly, City non-event gap sub-clips position shows that its corpora has slightly less diversity but better spread of vocabulary. City event-boundary and office non-event gap sub-clips are both placed in quadrant 4, where low diversity and uneven spread of vocabulary exists in the same corpora.

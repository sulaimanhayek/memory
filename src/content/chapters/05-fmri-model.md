---
title: "Chapter 5: fMRI-Based Model of Event Segmentation"
slug: fmri-model
author: Sulaiman Ahmed
date: 2025-09-01
categories: [fMRI, neuroscience]
image: /posts/welcome/thumbnail.jpg
note: "Neural signatures of event boundaries and their relationship to recall."
tag: fMRI
order: 5
---
# 5.1 Introduction
Understanding how humans segment continuous experience into discrete events has been a central question in cognitive neuroscience. While the Event Segmentation Theory (EST) provided a framework for how perception and memory work, recent work have extended the segmentation of events into the neural domain by using functional magnetic resonance imaging (fMRI) to detect transitions in the brain activity while participants watch natural-scenes videos.

In this chapter, we introduce the original fMRI model that led the predictions of subjective time from human brain activity based on salient events (Sherman et al., 2022). In the next sections, we report the fMRI-study findings, and reverse-engineer (roll-back) time-estimations to salient events detected at each repetition time (TR). The primary dataset used in this chapter originates from Sherman et al. (2022), which is provided publicly on Open Science Framework (OSF). In general, the study investigates, and build results and comparisons of a model-based analysis of visual cortex, and sensory cortex (auditory, somatosensory) BOLD, and a CNN-model (see figure 5.1).

# 5.2 Background
Let's revisit the imagined train journey from Brighton to London in chapter 1. Have you thought about the time spent on this journey? Do you worry about it being too long, and if so, how do you keep yourself busy? Passengers often read a book, watch a movie, or engage in a chat with another passenger to "kill time" and not feel bored. We humans, perceive time at a different pace from that of a clock, depending on the type of experience and activity we're doing (Fountas et al., 2021). When distracted with a movie, a chat with a friend, or a book, time seems to contract, and when paying attention to the clock, it seems to expand (Fountas et al., 2021). Passengers on that train journey perceive time differently from each other, depending on their stimulus complexity and what they're attending to (Sherman et al., 2022).

**Hypothesis**

In line with the findings of Roseboom et al. (2019) and Fountas et al. (2021), Sherman et al. (2022) propose that subjective duration is constructed from the accumulation of salient events, and "the common currency of time perception across processing hierarchies is change" (Sherman et al., 2022). How the processing hierarchy respond to the stimulation defines what a "change" is, from an observer point of view.

# 5.3 Procedure
To test above hypothesis, Sherman et al. (2022) conducted a study, recruited 40 healthy participants, each viewed the same silent natural-scene videos (City vs. Office, ranging from 8 to 24 seconds) used in Roseboom et al. (2019) and Mariola et al. (2022) while under fMRI scanner. Participants were not given a prior training, and they reported their best guess durations using a visual analogue slider. Each participant completed 20 trials presented in a random order, and those sub-clips are sampled from Roseboom et al. (2019) library of videos. It is worth recalling that in chapter 4, we kept the reference of this fMRI study in perception census dataset to join the two datasets later to generate events-boundaries, in chapter 6 we will align the boundaries coming from those 3 studies: CNN-mode, perception census model, and fMRI-model.

# 5.4 Results

## 5.4.1 Human behavioural results
As mentioned above, participants watched 20 trials of videos, half of which were based in the city of Brighton and the other half inside an office setting at the University of Sussex. Figure 5.2 shows the results of human estimations of time grouped by city and office videos relative to actual video length. Human estimations have strong correlation with the video duration (rAvg = 0.96). Overall, results show scene-type bias, that is an over-estimation of duration for city videos, and under-estimation of duration for office videos of ±5.23% (Sherman et al., 2022). We will re-visit this scene-type bias once more in our online behavioural study following data processing and analysis.

## 5.4.2 CNN-model
The authors used deep convolutional neural network (CNN) model, based on Roseboom et al.'s (2019) model of time perception we adapted in chapter 3 for event-segmentation. AlexNet-based model architecture makes it a perfect fit to demonstrate that a hierarchical system with few layers can track changes and produce similar biases in perceived duration to that of humans (Sherman et al., 2022). Results of the CNN-model correlated with the actual durations of each video (ρ = 0.73, p < 0.001), and biases mirrored human-observed results by type, an over-estimation of city durations and under-estimations of office durations. Figure 5.3 shows the artificial network duration prediction, and normalised bias. Duration estimation were made based on multiple linear regression model trained on clock durations.

## 5.4.3 Computational modelling based on BOLD
As noted earlier, Blood Oxygenation Level Dependent (BOLD) was measured while participants watched videos. Echo-Planar Imaging (EPI) files of a 2 dimensional space were captured every 800 milliseconds (TR) for 2mm slices with 2mm gaps. The goal is to test that "tracking changes in perceptual processing in the modality-specific human sensory hierarchy is enough to predict human-based trial-by-trial biases in subjective duration" (Sherman et al., 2022). In principal, instead of accumulating the salient (surprise) events across the video frames (stimuli) to estimate durations, coarse changes on voxel-level are accumulated based on BOLD activity responses to the stimuli.

The authors pre-defined 3 layers (pre-registered) per sensory region. The 3 layers are chosen based on the understanding of the visual processing through its hierarchies, lower layers represents the processing of low-level features (i.e., edge detection), and higher layers mirrors object-related processing (i.e., lateral occipital cortex), Equivalent hierarchies were defined for auditory and somatosensory cortex regions. Figure 5.4 below shows the perceptual hierarchies used for fMRI-based model analysis. Since the videos were silent, it was predicted that only the visual cortex model will reconstruct time estimations from accumulated salient events (Sherman et al., 2022). Thus it will be the focus of our salient events reconstruction in the upcoming section.

### 5.4.3.1 Visual model
Voxel-wise patterns of BOLD were extracted from each time point (TR) in each hierarchical layer, for each participant. Voxel changes between each TR are calculated and then summed over all over all the voxels in the layer (Sherman et al., 2022), two methods were used to calculate the changes between voxels at each TR, first one (pre-registered) is the Euclidean distance, second one (exploratory) is the signed difference (see (2a) and (2b) in figure 5.5). Those changes were standardised and compared to a dynamic value to label values as salient events or not. This gives the number of salient events per layer (see figure 5.5, (3) accumulation of salient events). Similar to the CNN-model, Euclidean distance is calculated (for pre-registered), representing change between TR's:

$$\Delta_{TR} = \sum_{\nu} |X_{TR,\nu} - X_{TR-1,\nu}|$$

where:
- $X_{TR,\nu}$ is activation in voxel v at slice TR.

As for the exploratory analysis, signed difference equation is used:

$$\Delta'_{TR} = \sum_{\nu} (X_{TR,\nu} - X_{TR-1,\nu})$$

Signed Difference equation is used in place of the Euclidean equation because its more closely aligned with the idea that BOLD (in early sensory networks in this case) indicates (computational) prediction error (Sherman et al., 2022).

Up to this point, only accumulations of salient events are counted, and the goal is to compute durations in seconds. To bridge this gap, a Support Vector Regression (SVR) is used to learn mappings between accumulated salient events and actual video durations (see (4) in figure 5.5). SVR is trained on actual video durations, and 10 fold cross-validation is used to prevent over-fitting. Lastly, duration predictions (output of SVR) is transformed into bias by grouping durations by video, and calculate deviations from the model's average for that video (see (5a) in figure 5.5).

**Euclidean distance:** In the pre-registered analysis, human participants' behavioural data is pooled to create one super-subject (Note the reason behind creating super-subject is to test whether patterns in BOLD activity generalize across individuals). Z-scored durations were correlated with human durations (See (A), figure 5.6), but did not fully distinguish (though it captured the difference) between office and city environments (See (B), figure 5.6). The super-subject data is used as a reference for the visual model based on BOLD.

In the visual model (based on BOLD only), changes in voxel activity is calculated using Euclidean distance, and follows the analysis pipeline explained in figure 5.5. Visual model predicted durations based on Euclidean distance showed strong correlation with actual video durations (rvisual = 0.93). This was expected, as longer durations will produce more accumulated events and any model will correlate with clock time. The real test of the visual model was the biases correlations. In other words, will the visual model produce an over-estimation of durations in city environment and an under-estimation in office scenes reported by humans. Results showed an agreement with human behavioural results (M ± SD_diff = 0.19 ± 13.96) but not as strong to be considered a correlation (t2329 = 0.33, p = 0.739) thus it fails to capture scene-type differences. Figure 5.7 shows (A) the Association between presented video duration and model predicted durations for visual Euclidean Distance model, and (B) shows Mean normalized bias of the visual model for office versus city scenes.

**Signed difference:** The second implementation (i.e., exploratory analysis) is based on the Signed Difference (SD), which is used to determine salient events. Similar to the Euclidean difference case, predicted video durations from salient events correlated with the presented veridical durations (r̄visual = 0.95, See (A) figure 5.8). When using the revised exploratory definition of salient event, linear mixed models showed that visual model biases discriminate – in a similar fashion to that of human behaviour – between office and city environments (See (B), figure 5.8) where on average, the model estimates were 4.22 units higher for city videos (M ± SD_diff = 4.22 ± 3.37), and a confidence level of 95% between [3.14, 5.30].

Additionally, It was found that the visual model results were correlated with participants' trial-by-trial biases. Figure 5.9 shows this association between the two by plotting mean model bias as a function of 25 quantiles of human normalized bias (See (A), figure 5.9), and the model performance was robust to how salient events were categorised (See (B), figure 5.9) where the lower and upper bounds (standard deviations) represents the threshold to consider BOLD changes as salient or not. Dark colours represent regions where the association was non-significant at α = 0.05 or negative, and lighter colours indicate positive associations (Sherman et al., 2022).

# 5.5 Re-constructing salient events from visual model
In previous sections, we provided the data-evidence and rationale behind choosing the visual model in our analysis. We also explored the analysis pipeline used to derive the predictions of duration estimations based on BOLD changes and the differences and implications of using Euclidean distance and Signed Difference equations. In this section, we reverse-engineer the process of time-estimations originally developed by Sherman et al. (2022) based on the supported files and documentation publicly available and in close coordination with the authors.

## 5.5.1 Files structure
Participants processed data files were downloaded from OSF's public project published by Sherman et al. (2022). A series of processing actions is applied to the raw data such as motion correction and normalisation to MNI space (Sherman et al., 2022). For each region of interest ROI, a mask is defined using a SPM toolbox called WFU PickAtlas. Those binary masking files are then applied to fMRI, such that only voxels in selected regions are kept. The generated .mat files per region are shown in figure 5.10, where rLOC, rV1, rVO belong to visual regions (occipital cortex), rBA22, rBA41, rBA42 are in auditory regions, and rBA1, rBA2, rBA3 are in somatosensory. Each .mat file contains a variable named subjData with n_blocks × n_trials struct array. For example, the signed differences from the 4th trial of the 1st block is in subjData{1,4} signed Difference.

```
subj_04/
    rBA1.mat
    rBA2.mat
    rBA3.mat
    rBA22.mat
    rBA41.mat
    rBA42.mat
    rLOC.mat
    rV1.mat
    rVO.mat
```

## 5.5.2 Data processing
Our core project folder contains sub-folders of subjects, where each subject reflects the submission of one participant. Each file (e.g., rv1.mat) has a main variable called subjData which is a 3 × 20 array. the first parameter means 3 blocks, and the second parameter means 20 trials each. Each trial has the following parameters and shapes:

| Parameter | Size |
|---|---|
| duration | shape: (1,1) |
| isCity | shape: (1,1) |
| report | shape: (1,1) |
| euclideanDistance | shape: (30,1) |
| signedDifference | shape: (30,1) |
| normalisedBias | shape: (1,1) |

*Table 5.1: Parameters and shapes of each trial of the fMRI study*

We define a function that loops over the layers of the passed region (i.e., visual region), where layer 1 is rV1, layer 2 is rLOC, and layer 3 is rVO.

```matlab
% Listing 5.1: Loop over the layers of a region
rng(11);
addpath('dependencies')

for participantNumber = 4:45
    subjpath = sprintf('subj_%02d/', participantNumber);

    if ~exist(subjpath, 'dir')
        fprintf('Skipping participant %d - folder not found: %s\n', participantNumber, subjpath);
        continue;
    end

    fprintf('\n Running participant %d (%s)...\n', participantNumber, region);

    for layer = 1:3
        try
            fprintf('Layer %d (%s)...\n', layer, analysis);
```

Then we define layers of each region, using below code, when specific region (e.g., visual) the code will only parse the layers of that specific region (rV1, rLOC, rVO).

```matlab
% Listing 5.2: Loading layers files for the requested region
switch region
    case 'visual'
        mask_list = {'rV1', 'rLOC', 'rVO'};
    case 'auditory'
        mask_list = {'rBA41', 'rBA42', 'rBA22'};
    case 'somatosensory'
        mask_list = {'rBA3', 'rBA1', 'rBA2'};
    otherwise
        error('Unknown region: %s', region);
end

mask = mask_list{layer};
mfile = [subjpath mask '.mat'];
```

Each layer, has specific decay and threshold bounds related to it, in the below code snippet we set threshold resets to tmax when a salient event is detected and then decay towards tmin (within small Gaussian noise)

```matlab
% Listing 5.3: tmax, tmin, decay rate, and noise per layer.
switch layer
    case 1
        tmax = 1.5; tmin = -1; decay_rate = 1; noise_sd = 0.05;
    case 2
        tmax = 1.5; tmin = -0.5; decay_rate = 1; noise_sd = 0.05;
    case 3
        tmax = 1.5; tmin = 0; decay_rate = 1; noise_sd = 0.05;
end

baseline = tmin;
slope = tmax + baseline; % (recursive form used below)
```

We define two parameters, one called "y" to capture time-point level event across all TR's, and another one called "d" to store trial-level data that links event to behaviour.

```matlab
% Listing 5.4: TR-level and Trial-level Data Structures
y = struct('cVal', [], 'isSalient', [], 'zDiff', [], 'TR', [], 'isNan', []);
d = struct('nSalient', [], 'report', [], 'isCity', [], 'bias', [], 'duration', []);
global_TR_counter = 0;
[n_blocks, n_trials] = size(subjData);
```

In the next code snippet, we define the two types of analyses based on Sherman et al. (2022) analysis plan: Euclidean Distance and Signed Difference. We define 3 arrays: all_z is only long vector of the TR data we'll be analysing (euclideanDistance or signedDifference) for every trial and run. The second array is all_trial_labels and is used to store the trial index for each element in all_z array, this is essential to map TRs back to their original trial. Lastly we have all_run_labels which stores the run(s) index for each element in all_z

```matlab
% Listing 5.5: Euclidean Distance and Signed Difference analyses.
all_z = [];
all_trial_labels = [];
all_run_labels = [];

for irun = 1:n_blocks
    for itrial = 1:n_trials
        switch analysis
            case 'euclideanDistance'
                z = subjData{irun, itrial}.euclideanDistance;
            case 'signedChanges'
                z = subjData{irun, itrial}.signedDifference;
            otherwise
                error('Unknown analysis type: %s', analysis);
        end

        all_z = [all_z; z];
        all_trial_labels = [all_trial_labels; repmat(itrial, numel(z), 1)];
        all_run_labels = [all_run_labels; repmat(irun, numel(z), 1)];
    end
end
```

Once we have above arrays loaded, we implement the detection for salient events functionality. For every TR in the all_z array, we apply the dynamic threshold, first a reset flag is set to "0" and the internal decay timer t is initialized. If the incoming value at the current "TR" < 2.5, it will be valid, and the decay is either reset to one (if the previous step was salient), or incremented (if it wasn't salient). A TR is marked salient if its signal exceeds the current threshold.

```matlab
% Listing 5.6: Salient detection
reset_criterion = 0;
t = 0;

for itr = 1:numel(all_z)
    global_TR_counter = global_TR_counter + 1;

    if all_z(itr) < 2.5 % outlier guard
        if reset_criterion
            t = 1; % reset decay timer after an event
        else
            t = t + 1;
        end

        noise = normrnd(0, noise_sd);

        if t == 1
            c = tmax; % hard reset
        else
            c = y.cVal(end) - slope * exp(-t * decay_rate) + baseline; % recursive decay
        end

        y.cVal = [y.cVal; c + noise];
        y.zDiff = [y.zDiff; all_z(itr)];
        isSalient = y.zDiff(end) >= y.cVal(end);
        y.isSalient = [y.isSalient; isSalient];
        reset_criterion = isSalient;
        y.isNan = [y.isNan; 0];
    else
        y.cVal = [y.cVal; NaN];
        y.zDiff = [y.zDiff; NaN];
        y.isSalient = [y.isSalient; false];
        y.isNan = [y.isNan; 1];
    end

    y.TR = [y.TR; global_TR_counter];
end
```

Lastly, we save TR flags into event counts per trial:

```matlab
% Listing 5.7: save TR flags
for irun = 1:n_blocks
    for itrial = 1:n_trials
        trial_TRs = find(all_run_labels == irun & all_trial_labels == itrial);
        if isempty(trial_TRs), continue; end

        d.nSalient = [d.nSalient; sum(y.isSalient(trial_TRs))];
        d.report = [d.report; subjData{irun, itrial}.report];
        d.duration = [d.duration; subjData{irun, itrial}.duration];
        d.isCity = [d.isCity; subjData{irun, itrial}.isCity];
        d.bias = [d.bias; 100 * subjData{irun, itrial}.normalisedBias];
    end
end

y.salient_TR_indices = y.TR(y.isSalient == 1);
output_filename = sprintf('participant_%02d_layer%d_%s_y.mat', ...
    participantNumber, layer, analysis);
save(output_filename, 'y', 'subjData');
fprintf('Saved: %s\n', output_filename);
```

Code snippets explained above were combined together as one script and executed on folders of 40 participants. The files are exported as .mat files in output directory defined. See files structure resulted below:

```
output/
    subject_04_visual_layer_1.mat
    subject_04_visual_layer_2.mat
    subject_04_visual_layer_3.mat
    subject_05_visual_layer_1.mat
    subject_05_visual_layer_2.mat
    subject_05_visual_layer_3.mat
    ...
    subject_45_visual_layer_1.mat
    subject_45_visual_layer_2.mat
    subject_45_visual_layer_3.mat
```

Each file, contains a table of N × 5, where N is the total number of TRs and the 5 parameters mentioned below in table 5.2:

| Parameter | Size |
|---|---|
| y.cVal | N × 1 |
| y.zDiff | N × 1 |
| y.isSalient | N × 1 |
| y.TR | N × 1 |
| y.isNan | N × 1 |

*Table 5.2: Parameter sizes of the y table.*

- y.cVal: is the dynamic criteria value at each TR.
- y.zDiff: is the z-Score change at each TR.
- y.isSalient: is the salient classifier, if salient it will be set to "1" otherwise it will be "0".
- y.TR: is the global TR index tracker.
- y.isNan: it will be set to "1" if the TR is invalid, otherwise it will be set to "0".

## 5.5.3 Salient events extraction
This sub-section marks the last step of re-constructing salient events from the visual model section. The goal is to take each participant's TR-by-TR salient events output we exported earlier in section 5.5.2, parse the vector and re-slice it back into trials using the final output timings file "master_dataset.csv" produced by Sherman et al. (2022). The parameters (columns) listed below in table 5.3 are loaded.

| Parameter | Description |
|---|---|
| run | Run index |
| trial | Trial index |
| movieStartFrame | Starting frame of the video in the stimulus file |
| movieID | Identifier of the video |
| isCity | Condition flag (e.g., city vs office) |
| veridicalDuration | True clip duration (seconds) |
| humanReport | Participant's duration report (seconds) |

*Table 5.3: Parameters loaded from master_dataset.csv for each participant and trial.*

We align TRs to trials by computing the number of TRs belong to each trial from the master_dataset.csv, for example if veridicalDuration = 24.0 then 24.0/0.8 = round(30) = 30TRs for that trial, below code show this calculation:

```matlab
% Listing 5.8: Compute number of TRs
TR_duration = 0.8; % seconds per TR
trial_lengths = round(participant_rows.veridicalDuration / TR_duration);
```

Vectors are loaded from visual model layers per participant and per layer:

```matlab
% Listing 5.9: Load visual model layers
input_mat_file = sprintf('export/subject_%02d_visual_layer_%d.mat', participantNumber, layer);
load(input_mat_file, 'y')
```

We then check the number of TRs (time points) in the y structure (from visual layers) match what is expected from the master dataset. If they differ, it adjusts the last trial so that lengths match:

```matlab
% Listing 5.10: Check number of TRs
expected_total_TRs = sum(trial_lengths);
actual_total_TRs = length(y.isSalient);
length_diff = expected_total_TRs - actual_total_TRs;
trial_lengths(end) = trial_lengths(end) - length_diff;
```

Lastly, within each trial, we convert the TR index to seconds (using the constant TR_duration = 0.8), and then we convert seconds to absolute video frames, using the master dataset's movieStartFrame and the constant frame_rate = 30:

```matlab
% Listing 5.11: Convert TRs to frame numbers
trial_salient_flags = y.isSalient(trial_TR_indices);
trial_salient_TRs = find(trial_salient_flags); % TR indices within trial
salient_times_sec = trial_salient_TRs * TR_duration;
frame_rate = 30;
salient_frame_numbers = round(row.movieStartFrame + salient_times_sec * frame_rate);
```

# 5.6 Summary and outlook
In the preceding three chapters, 3 milestones were achieved:
- preparation of CNN-model dataset.
- preparation of perception census dataset.
- preparation of fMRI-model dataset

By the end of this chapter, we have now aligned these datasets to be on the same temporal level, and share common identifiers such as video_id, run_id, trial_id, number of salient events per video, and timestamps of each identified salient event. These parameters form the foundation for subsequent analyses in the next chapter, and play an important role in finding points-of-agreement and generating dynamic-event boundaries around salient (surprise) events.

By collecting and integrating behavioural, Artificial network model, and computational model datasets within one-framework, we aim to provide a strong statistical approach that detects patterns and gaps in neural changes, and challenge existing theories and beliefs of perception and memory.

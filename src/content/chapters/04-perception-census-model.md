---
title: "Chapter 4: Perception Census Model"
slug: perception-census-model
author: Sulaiman Ahmed
date: 2025-08-15
categories: [perception, modelling]
image: /posts/welcome/thumbnail.jpg
note: "A perception-led model integrating salience and subjective dimensions."
tag: perception
order: 4
---
# 4.1 Introduction
The perception census is a scientific study to explore unique ways of how we perceive the world around us. Part of the Dreamachine programme, the Perception Census is led by Anil Seth and Fiona Macpherson. Several questions are tested in this study including how we perceive time, our beliefs about consciousness, and our sense of self.

In this chapter, we introduce the event segmentation task of perception census study. In total, 8,272 online participants took part in the event segmentation study, each participant completed two trials, resulting in 16,544 submissions. In this task, online participants viewed silent, naturalistic videos and were asked to indicate when a perceptual or semantic change takes place ("events"), such as a car passing by or a person exiting the field of view. As the video played, participants indicated when these changes occurred by pressing a button on the screen below the video. Each participant was presented with two videos randomly selected from the video stimulus set used by Sherman et al. (2022).

# 4.2 Online task
Online tasks were developed on Laravel framework, and hosted on Amazon AWS cloud servers. Each task contained 2 trials, each trial consists of one video randomly picked from the video stimulus set used by Sherman et al. (2022). The independent variables were the duration of the presented videos: 8, 12, 16, 20, or 24 seconds long, and whether the videos depicted scenes sitting in a quiet Office or walking around the City of Brighton, UK. The primary dependent variable was where in the timeline of the presented video the participant made their event annotation, indicating that something in the scene had changed.

Prior to starting the task, participants were provided with the following instructions:

> In this task, you will watch two videos of everyday scenes. Your task will be to divide each video into a series of events. An event can be defined as a meaningful part of the video and is marked by a change in what you see. A new event can be inserted whenever something captures your attention. For example: a child running past, a car suddenly entering view or a person leaving the field of view. Every time you notice a new event, click the Add Event button. The button will briefly turn red to confirm that the event has been inserted. Click Next to see an example of how to add events.

Figure 4.1 shows the task interface on the website. The duration bar is hidden from the video window, and there are no buttons or options to pause, skip forward, or skip backward. A button is presented below the video window to add new events. Participants are given the chance to review the position of the events they segmented, add new event or completely remove previously chosen ones. Figure 4.2 shows the window of reviewing the trials, note the annotations in red to highlight the location of events segmented.

# 4.3 Data structure
The structure of incoming data is not homogeneous nor consistent. Unexpected gaps and spaces were added on the back-end level and irrelevant back slashes between parameters. The frequency and quantity of gaps and back slashes are not consistent across the dataset presenting a challenge to clean the dataset such that each user's node is similar to the other. Additionally, on the processing level, the stimulus identifier (i.e., link) is not uniform, adding another level of complexity to distinguish which video stimuli was displayed to the user. Figure 4.1 shows data structure of one submission. Highlighted bits are the relevant data points to process. light green represents the user identifier, light blue is the number of events segmented in the first time, and in the second (review) time, light grey is the stimulus displayed to participant, light purple represents the list of timestamps of each segmented event (note it's empty in first trial, corresponding to zero events), and light orange represents gaps or spaces generated at the platform back-end level. Figure 4.4 de-code the stimuli words and what each link subsection means. The light yellow represents original video ID (Video IDs 1 through 5 correspond to city scenes), Light red represents the starting frame in the original long video (out of 9,000 frames), cyan represents the duration of the stimulus, and light brown is the reference to the fMRI subject ID, Run ID, and Trial ID. In the next section, we explain the processing steps to clean and prepare the data for the boundary selection and online behavioural study in chapter 6.

# 4.4 Data processing

## 4.4.1 Remove quotes, back slashes, and white space
First step to take was to remove the gaps and back slashes from the nodes. In the code listing below, fix_json_string method target all nodes with a method to clean malformed strings (i.e., missing brackets and parenthesis, back slashes, incomplete lists) and rebuilt each component, correctly.

```python
# Listing 4.1: Fix json string (quotes, backslashes, whitespace)
def fix_json_string(clean: str) -> str:
    clean = re.sub(r'"timestamps"\s*:\s*\[([^\[\]]+)$', r'"timestamps": [\1]', clean)
    clean = clean.replace('\\"', '"').replace('""', '"')
    clean = clean.replace('"[', '[').replace(']"', ']')
    clean = clean.strip()

    clean = re.sub(r'(":[0-9])\s+(?=")', r'\1, ', clean)
    clean = re.sub(r'(?<=[\d\]])(?=\s*"[^"]+":)', ', ', clean)
    clean = re.sub(r'(?<=\d)\s+(?=\d)', ', ', clean)
```

## 4.4.2 Fix space separated values, commas, and extra characters
Another issue we faced is the irregular formatting of values within lists, resulting in a broken JSON nodes. Code section below fixes values in lists, adds commas between them, and removes any irrelevant characters. Additionally, this method fixes repeated "]]" and "}}", and removes any duplicate commas.

```python
# Listing 4.2: Fix space separated values, commas, and characters
clean = re.sub(
    r'\[\s*([\d\.]+\s+)+[\d\.]+\s*\]',
    lambda m: "[" + ", ".join(m.group(0)[1:-1].split()) + "]",
    clean
)
clean = clean.rstrip(', \n\t')
clean = re.sub(r',\s*,+', ',', clean)
clean = re.sub(r'\]\]+', ']', clean)
clean = re.sub(r'\}\}+', '}', clean)
```

## 4.4.3 Unclosed arrays and lists
When formatting the file into JSON friendly-format we noticed another unexpected nodes where the lists and arrays are not closed properly, which causes the editor to throw exceptions. To fix this we set a pointer that looks at the last character in a given line. if it's missing a closing of a list or array, it adds one. See below listing:

```python
# Listing 4.3: Fix unclosed arrays and lists
if not clean.strip().endswith('}]'):
    if clean.endswith(']'):
        clean += '}'
    elif clean.endswith('}'):
        clean = clean[:-1] + '}]'
    else:
        clean += '}]'
```

## 4.4.4 Wrapping and validating timestamps
Timestamps array is critical to our data model, Any malformation or shift in positions may cause failure in run-time. In the code snippet below, we check for each opening and closing of a timestamp, and return an empty list if the array is broken. The code also checks for the extra characters placed within the array or at the boundaries. It's worth noting that if a corrupt timestamp is found (unclosed array) it's impossible to know whether it's a complete or incomplete array, with try-and-error this became a real challenge and continuously broke our code when closing it due to a sequence of complex conditions – as seen above – as a result we replace the broken list with an empty list, and we catch the finalised list (The back-end takes first list of timestamps and concatenate it with the reviewed list of a trial, resulting in an often complete timestamp).

```python
# Listing 4.4: Wrapping and validating timestamps
if re.search(r'"timestamps"\s*:\s*\[.*$', clean) and not re.search(r'"timestamps"\s*:\s*\[.*\]', clean):
    clean = re.sub(r'"timestamps"\s*:\s*\[.*$', '"timestamps": []', clean)
```

## 4.4.5 Complete partial submissions
Despite addressing missing characters, commas, clearing back slashes, and broken lists and arrays, we were faced with partial submissions. A partial submission often has the first section of a trial only. In this scenario, we re-code and reconstruct the missing parts with default fields like "n_events_secondpass": 0, then we copy the first timestamp to list to finalised timestamps, and we recalculate n_events from the array length.

```python
# Listing 4.5: Fix partial submissions
def fix_common_truncation_errors(text: str) -> str:
    # If the text ends right after timestamps_firstpass and has no other fields
    if '"timestamps_firstpass":' in text and '"timestamps_secondpass"' not in text:
        match = re.search(r'"timestamps_firstpass":\s*\[[^\]]*\]', text)
        if match:
            array_str = match.group().split(":", 1)[1].strip()
            return (
                f"[{{{match.group()}, "
                f'"n_events_secondpass": 0, "timestamps_secondpass": [], '
                f'"n_events": {len(json.loads(array_str)) if array_str.strip() else 0}, '
                f'"timestamps": {array_str}}}]'
            )
    return text
```

For example if the input is:
```json
// Partial submission example
{"timestamps_firstpass": [1.2, 2.3, 3.4]
```

The complete submission will be:
```json
[{
    "timestamps_firstpass": [1.2, 2.3, 3.4],
    "n_events_secondpass": 0,
    "timestamps_secondpass": [],
    "n_events": 3,
    "timestamps": [1.2, 2.3, 3.4]
}]
```

The reason we are completing this partial submission and not skipping over it is this partial submission could be deep in the record. Trial one could be processed, but trial two may have this partial submission. In this case reverting or going a step back can interrupt the series of actions taken in a previous step. Specially that our code is ran in sequential execution, one instruction after another from top to bottom.

## 4.4.6 Extract data from stimulus links
Stimulus links provide us with valuable information about the type of videos segmented. Parsing links require a level of sophisticated programming. It's worth reminding the reader of figures 4.3 and 4.4, notice the stimulus link has host folder locations (which has irrelevant data) and the relevant bits starts after "video" subsection. This metadata is extracted via regex that finds similar structure to what is available in the JSON nodes. Code snippet below shows the regex code:

```python
trial_matches = re.findall(
    r'video_(\d+)_StartFrame_\d+_StimDuration_(\d+)_.*?\.mp4',
    raw
)
```

## 4.4.7 Returned data shape
Each record – which represents a single user – is then returned with trial 1 and trial 2 data points. Output JSON (and xlsx format) is organised as follows:

```json
{
    "user_id": "userxyz",
    "trial_1_events": 3,
    "trial_1_timestamps": [1.2, 2.3, 3.9],
    "trial_1_video_type": "city",
    "trial_1_video_duration": 12,
    "trial_1_video_name": "video_3_StartFrame_240_StimDuration_12_FMRISubID_2_RunID_2_TrialID_19.mp4",

    "trial_2_events": 2,
    "trial_2_timestamps": [0.8, 4.1],
    "trial_2_video_type": "office",
    "trial_2_video_duration": 8,
    "trial_2_video_name": "video_7_StartFrame_80_StimDuration_8_FMRISubID_4_RunID_1_TrialID_5.mp4"
}
```

## 4.4.8 Reshaping cleaned data
Cleaned dataset returned from previous section is at the user level. We foresaw a video-level data structure in our complete model (see chapter 6), henceforth, in this section we reshape the data using a script built separately.

Simply, we define a trial_1 data frame, and trial_2 data frame and instead of concatenating (the default structure), we stack them on top of each other. Table 4.1 shows an example of the output shape where trial_number is extracted from the original shape (i.e., not the stimulus link).

| user | trial | video | Type | n_events | Timestamps | Duration |
|---|---|---|---|---|---|---|
| A001 | 1 | video_3.. | city | 3 | [1.2, 2.3, 3.4] | 24 |
| A001 | 2 | video_5.. | office | 2 | [0.8, 4.1] | 20 |
| A002 | 1 | video_2.. | city | 4 | [1.0, 1.8, 3.5, 5.0] | 16 |

*Table 4.1: Example (dummy data) of rows from event_data_by_video.csv, showing one trial per row.*

To recap, figure 4.5 show the steps taken to process unstructured raw data, generate a user-based dataset, and then reshape it such that each trial is on a separate row. We will use this dataset in Chapter 6 to merge timestamps across participants by video using Boundary peak detection, a method that identify events in agreement amongst participants, and drive the selection for event-boundaries.

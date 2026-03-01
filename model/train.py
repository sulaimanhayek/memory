"""
Fine-tunes GPT-2 (124M) on thesis text using HuggingFace Trainer API.

Usage:
    python model/train.py

Expects prepared data in model/data/ (run prepare_data.py first).
Saves fine-tuned model to model/output/.
"""

import os
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    DataCollatorForLanguageModeling,
    Trainer,
    TrainingArguments,
)

MODEL_NAME = "gpt2"
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
MAX_LENGTH = 512


def main():
    # Load tokenizer and model
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)

    # Load both thesis chunks and Q&A pairs
    data_files = []
    for fname in ["thesis_chunks.jsonl", "qa_pairs.jsonl"]:
        path = os.path.join(DATA_DIR, fname)
        if os.path.exists(path):
            data_files.append(path)

    if not data_files:
        print("No training data found. Run prepare_data.py first.")
        return

    dataset = load_dataset("json", data_files=data_files, split="train")
    print(f"Loaded {len(dataset)} training examples")

    # Tokenize
    def tokenize(examples):
        return tokenizer(
            examples["text"],
            truncation=True,
            max_length=MAX_LENGTH,
            padding="max_length",
        )

    tokenized = dataset.map(tokenize, batched=True, remove_columns=["text"])

    # Data collator for causal LM (labels = input_ids shifted)
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False,
    )

    # Training arguments — tuned for small dataset on CPU
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        overwrite_output_dir=True,
        num_train_epochs=3,
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        learning_rate=5e-5,
        weight_decay=0.01,
        warmup_steps=50,
        logging_steps=10,
        save_strategy="epoch",
        save_total_limit=2,
        fp16=False,  # CPU training, no fp16
        report_to="none",
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized,
        data_collator=data_collator,
    )

    print("Starting fine-tuning...")
    trainer.train()

    # Save final model and tokenizer
    trainer.save_model(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)
    print(f"Model saved to {OUTPUT_DIR}")


if __name__ == "__main__":
    main()

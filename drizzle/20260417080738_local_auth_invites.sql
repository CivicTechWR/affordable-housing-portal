CREATE TABLE "user_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"sent_at" timestamp with time zone,
	"accepted_at" timestamp with time zone,
	"created_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "invite_accepted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_invites" ADD CONSTRAINT "user_invites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_invites" ADD CONSTRAINT "user_invites_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_invites_token_hash_unique" ON "user_invites" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "user_invites_user_id_idx" ON "user_invites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_invites_email_idx" ON "user_invites" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_invites_created_by_user_id_idx" ON "user_invites" USING btree ("created_by_user_id");
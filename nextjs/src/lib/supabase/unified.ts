import {SupabaseClient} from "@supabase/supabase-js";
import {Database, TaskPriority, TaskStatus} from "@/lib/types";

export enum ClientType {
    SERVER = 'server',
    SPA = 'spa'
}

export class SassClient {
    private client: SupabaseClient<Database>;
    private clientType: ClientType;

    constructor(client: SupabaseClient, clientType: ClientType) {
        this.client = client;
        this.clientType = clientType;

    }

    async loginEmail(email: string, password: string) {
        return this.client.auth.signInWithPassword({
            email: email,
            password: password
        });
    }

    async registerEmail(email: string, password: string) {
        return this.client.auth.signUp({
            email: email,
            password: password
        });
    }

    async exchangeCodeForSession(code: string) {
        return this.client.auth.exchangeCodeForSession(code);
    }

    async resendVerificationEmail(email: string) {
        return this.client.auth.resend({
            email: email,
            type: 'signup'
        })
    }

    async logout() {
        const { error } = await this.client.auth.signOut({
            scope: 'local',
        });
        if (error) throw error;
        if(this.clientType === ClientType.SPA) {
            window.location.href = '/auth/login';
        }
    }

    async uploadFile(myId: string, filename: string, file: File) {
        filename = filename.replace(/[^0-9a-zA-Z!\-_.*'()]/g, '_');
        filename = myId + "/" + filename
        return this.client.storage.from('files').upload(filename, file);
    }

    async getFiles(myId: string) {
        return this.client.storage.from('files').list(myId)
    }

    async deleteFile(myId: string, filename: string) {
        filename = myId + "/" + filename
        return this.client.storage.from('files').remove([filename])
    }

    async shareFile(myId: string, filename: string, timeInSec: number, forDownload: boolean = false) {
        filename = myId + "/" + filename
        return this.client.storage.from('files').createSignedUrl(filename, timeInSec, {
            download: forDownload
        });
    }

    async getMyTodoList(page: number = 1, pageSize: number = 100, order: string = 'created_at', done: boolean | null = false) {
        let query = this.client.from('tasks').select('*').range(page * pageSize - pageSize, page * pageSize - 1).order(order)
        if (done !== null) {
            query = query.eq('done', done)
        }
        return query
    }

    async getAllUsers() {
        return this.client.from('profiles').select('id, email, name');
    }

    async getTasks({
        page = 1,
        limit = 6,
        search = "",
        status = "all",
        priority = "all",
        assignees = [],
        }: {
        page?: number
        limit?: number
        search?: string
        status?: TaskStatus | "all"
        priority?: TaskPriority | "all"
        assignees?: string[]
        }) {
        let query = this.client.from("tasks").select(`
            *,
            task_assignees(*, profiles(id, email, name)),
            comments(id)
          `, {
            count: 'exact',
          }
        )
          
        // Search functionality
        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
        }

        // Status filter
        if (status !== "all") {
            query = query.eq("status", status)
        }

        // Priority filter
        if (priority !== "all") {
            query = query.eq("priority", priority)
        }

        // Assignees filter
        if (assignees.length > 0) {
            query = query.in("task_assignees.user_id", assignees)
        }

        // Pagination
        const from = (page - 1) * limit
        const to = from + limit - 1

        query = query.order("created_at", { ascending: false }).range(from, to)

        const { data, error } = await query
        const { count: totalCount } = await this.client.from("tasks").select('*', { count: 'exact', head: true })

        if (error) throw error

        return {
            tasks: data,
            totalCount: totalCount || 0,
            totalPages: Math.ceil((totalCount || 0) / limit),
            currentPage: page,
        }
    }

    async createTask(row: Database["public"]["Tables"]["tasks"]["Insert"]) {
        return this.client
        .from('tasks')
        .insert(row)
        .select('*')
        .single()
    }

    async assignUsersToTask(taskId: string, userIds: string[]) {
        // Remove old assignees
        const { error: deleteError } = await this.client
            .from('task_assignees')
            .delete()
            .eq('task_id', taskId);

        if (deleteError) {
            return { data: null, error: deleteError };
        }

        // If no new assignees, just return empty
        if (!userIds.length) {
            return { data: [], error: null };
        }

        // Insert new assignees
        const rows = userIds.map((user_id) => ({ task_id: taskId, user_id }));
        return this.client.from('task_assignees').insert(rows);
    }

    async createTaskWithAssignees(
        taskRow: Database['public']['Tables']['tasks']['Insert'],
        assignees: string[]
    ) {
        // a) create task
        const { data: task, error: taskError } = await this.createTask(taskRow)
        if (taskError) throw taskError

        // b) insert assignees
        const { error: assignError } = await this.assignUsersToTask(
            task.id,
            assignees
        )
        if (assignError) throw assignError

        return task
    }

    async removeTask (id: string) {
        return this.client.from('tasks').delete().eq('id', id)
    }

    async updateTask(row: Database["public"]["Tables"]["tasks"]["Update"], assignees: string[] = []) {
        const res = await this.client.from('tasks').update(row).eq('id', row.id).select('*').single()
        if (res.error) throw res.error
        const task = res.data
        const { error: assignError } = await this.assignUsersToTask(
            task.id,
            assignees
        )
        if (assignError) throw assignError
        return task
    }

    async createComment(input: { task_id: string; author_id: string; content: string }) {
        const { data, error } = await this.client
            .from("comments")
            .insert([input])
            .select("*")
            .single();

        if (error) return { data: null, error };

        // Fetch the comment with profile data
        const { data: commentWithProfile, error: fetchError } = await this.client
            .from("comments")
            .select(`
                *,
                profiles (
                    id,
                    email,
                    name
                )
            `)
            .eq("id", data.id)
            .single();

        return { data: commentWithProfile, error: fetchError };
    }
    
    async updateComment(input: { id: string; content: string }) {
    return this.client
        .from("comments")
        .update({ content: input.content })
        .eq("id", input.id)
        .select("*, profiles(id, email, name)")
        .single();
    }
    
    async deleteComment(id: string) {
    return this.client.from("comments").delete().eq("id", id);
    }

    async getCommentsByTaskId(task_id: string) {
        return this.client
            .from("comments")
            .select(`
                *,
                profiles (
                    id,
                    email,
                    name
                )
            `)
            .eq("task_id", task_id)
            .order("created_at", { ascending: true });
    }

    getSupabaseClient() {
        return this.client;
    }


}

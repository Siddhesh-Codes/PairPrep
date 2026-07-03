import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DiscoveryService {
  constructor(private prisma: PrismaService) {}

  async discover(
    userId: string,
    typeIds?: string[],
    level?: string,
    search?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const myInterests = await this.prisma.userInterviewInterest.findMany({
      where: { userId },
    });
    const myAvailability = await this.prisma.userAvailability.findMany({
      where: { userId },
    });

    const interestIds = myInterests.map((i) => i.interviewTypeId);
    const slots = myAvailability.map((a) => `${a.day}:${a.slot}`);

    // If arrays are empty, provide a dummy element so ANY() matches nothing but runs successfully
    const sqlInterestIds = interestIds.length > 0 ? interestIds : ['00000000-0000-0000-0000-000000000000'];
    const sqlSlots = slots.length > 0 ? slots : ['DUMMY_SLOT'];

    const offset = (page - 1) * limit;

    // Dynamically construct SQL filters
    const conditions: Prisma.Sql[] = [
      Prisma.sql`p.profile_complete = true`,
      Prisma.sql`p.user_id != ${userId}::uuid`,
    ];

    if (level) {
      conditions.push(Prisma.sql`p.experience_level = ${level}::"ExperienceLevel"`);
    }

    if (typeIds && typeIds.length > 0) {
      conditions.push(Prisma.sql`EXISTS (
        SELECT 1 FROM user_interview_interests uii 
        WHERE uii.user_id = p.user_id 
          AND uii.interview_type_id = ANY(${typeIds}::uuid[])
      )`);
    }

    if (search) {
      const searchLike = `%${search}%`;
      conditions.push(Prisma.sql`(
        u.display_name ILIKE ${searchLike}
        OR p.bio ILIKE ${searchLike}
        OR EXISTS (
          SELECT 1 FROM user_interview_interests uii
          JOIN interview_types it ON it.id = uii.interview_type_id
          WHERE uii.user_id = p.user_id AND it.name ILIKE ${searchLike}
        )
      )`);
    }

    const whereClause = Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;

    // 1. Fetch paginated profile IDs and scores from PostgreSQL
    const query = Prisma.sql`
      SELECT 
        p.id as "profileId",
        p.user_id as "userId",
        u.display_name as "displayName",
        p.bio,
        p.experience_level as "experienceLevel",
        p.avatar_url as "avatarUrl",
        p.sessions_completed as "sessionsCompleted",
        p.avg_rating as "avgRating",
        p.rating_count as "ratingCount",
        p.linkedin,
        p.github,
        p.leetcode,
        p.is_linkedin_public as "isLinkedinPublic",
        p.is_github_public as "isGithubPublic",
        p.is_leetcode_public as "isLeetcodePublic",
        (
          (COALESCE(i_overlap.count, 0)::float / ${Math.max(interestIds.length, 1)}) * 0.6 +
          (COALESCE(a_overlap.count, 0)::float / ${Math.max(slots.length, 1)}) * 0.4
        ) as "relevanceScore"
      FROM profiles p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN (
        SELECT user_id, COUNT(*)::integer as count
        FROM user_interview_interests
        WHERE interview_type_id = ANY(${sqlInterestIds}::uuid[])
        GROUP BY user_id
      ) i_overlap ON i_overlap.user_id = p.user_id
      LEFT JOIN (
        SELECT user_id, COUNT(*)::integer as count
        FROM user_availability
        WHERE (day::text || ':' || slot::text) = ANY(${sqlSlots})
        GROUP BY user_id
      ) a_overlap ON a_overlap.user_id = p.user_id
      ${whereClause}
      ORDER BY "relevanceScore" DESC, p.avg_rating DESC NULLS LAST, p.sessions_completed DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const rawResults = await this.prisma.$queryRaw<any[]>(query);

    // 2. Fetch the total count of matching profiles
    const countQuery = Prisma.sql`
      SELECT COUNT(*)::integer as count
      FROM profiles p
      JOIN users u ON u.id = p.user_id
      ${whereClause}
    `;
    const countResult = await this.prisma.$queryRaw<any[]>(countQuery);
    const totalElements = countResult[0]?.count || 0;

    // 3. Batch query interests and availability only for the paginated subset (e.g. 10 users)
    const matchedUserIds = rawResults.map((r) => r.userId);
    const userDetails = matchedUserIds.length > 0
      ? await this.prisma.user.findMany({
          where: { id: { in: matchedUserIds } },
          include: {
            interests: { include: { interviewType: true } },
            availability: true,
          },
        })
      : [];

    const userDetailsMap = new Map(userDetails.map((u) => [u.id, u]));

    const content = rawResults.map((r) => {
      const uDetail = userDetailsMap.get(r.userId);
      return {
        profileId: r.profileId,
        userId: r.userId,
        displayName: r.displayName,
        bio: r.bio,
        experienceLevel: r.experienceLevel,
        avatarUrl: r.avatarUrl,
        sessionsCompleted: r.sessionsCompleted,
        avgRating: r.avgRating,
        ratingCount: r.ratingCount,
        linkedin: r.isLinkedinPublic ? r.linkedin : null,
        github: r.isGithubPublic ? r.github : null,
        leetcode: r.isLeetcodePublic ? r.leetcode : null,
        interests: uDetail?.interests.map((i) => ({
          id: i.interviewType.id,
          name: i.interviewType.name,
          slug: i.interviewType.slug,
        })) || [],
        availability: uDetail?.availability.map((a) => ({
          day: a.day,
          slot: a.slot,
        })) || [],
        relevanceScore: r.relevanceScore,
      };
    });

    return {
      content,
      totalElements,
    };
  }
}
